const mongoose = require("mongoose")
const PdfChunk = require("../models/pdfChunk.model")
const { createEmbedding } = require("./embedding.service")

const VECTOR_INDEX_NAME = process.env.PDF_VECTOR_INDEX_NAME || "pdf_chunks_vector_idx"
const TOP_K = parseInt(process.env.RAG_TOP_K || "5", 10)
const SCORE_THRESHOLD = parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD || "0.1")

async function retrieveRelevantChunks(question, documentId) {
    if (!question || !documentId) {
        throw new Error("Question and documentId are required for retrieval.")
    }

    console.log(`RAG: creating embedding for question (${question.length} chars)`) 
    let queryEmbedding
    try {
        queryEmbedding = await createEmbedding(question)
    } catch (err) {
        console.error('RAG: failed to create query embedding', err)
        throw err
    }

    if (!Array.isArray(queryEmbedding) || !queryEmbedding.length) {
        console.warn('RAG: query embedding is empty or invalid', queryEmbedding)
    } else {
        console.log(`RAG: query embedding length = ${queryEmbedding.length}`)
    }

    const totalChunks = await PdfChunk.countDocuments({ documentId })
    console.log(`RAG: total stored chunks for document ${documentId}: ${totalChunks}`)
    if (totalChunks) {
        const sampleChunks = await PdfChunk.find({ documentId }).limit(5).lean()
        sampleChunks.forEach((c, i) => {
            if (Array.isArray(c.embedding)) {
                console.log(`RAG: stored chunk[${i}] embedding length = ${c.embedding.length}`)
                console.log(`RAG: stored chunk[${i}] embedding sample = ${c.embedding.slice(0,6)}`)
            } else {
                console.log(`RAG: stored chunk[${i}] has invalid embedding:`, c.embedding)
            }
        })
    }

    let results = []
    try {
        results = await PdfChunk.aggregate([
        {
            $vectorSearch: {
                index: VECTOR_INDEX_NAME,
                path: "embedding",
                queryVector: queryEmbedding,
                similarity: "cosine",
                numCandidates: 50,
                limit: TOP_K,
                filter: {
                    documentId: new mongoose.Types.ObjectId(documentId)
                }
            }
        }
    ])
    } catch (err) {
        console.error('RAG: vector search failed', err)
        // continue — results will be treated as empty
    }

    // If vector search returned no candidates, compute similarities locally as a fallback
    if (!results.length) {
        console.log('RAG: vector search returned 0 results — computing local cosine similarities fallback')
        const stored = await PdfChunk.find({ documentId }).lean()

        function cosine(a, b) {
            let dot = 0
            let na = 0
            let nb = 0
            for (let i = 0; i < a.length; i++) {
                const va = a[i] || 0
                const vb = b[i] || 0
                dot += va * vb
                na += va * va
                nb += vb * vb
            }
            if (na === 0 || nb === 0) return 0
            return dot / (Math.sqrt(na) * Math.sqrt(nb))
        }

        const scored = stored.map((c) => ({
            _id: c._id,
            content: c.content,
            metadata: c.metadata,
            embedding: c.embedding,
            score: Array.isArray(c.embedding) ? cosine(queryEmbedding, c.embedding) : null
        }))

        scored.sort((a, b) => (b.score || 0) - (a.score || 0))

        console.log('RAG: local scores', scored.map(s => s.score))

        // return top K (and allow passing threshold)
        const topCandidates = scored.slice(0, TOP_K)
        return topCandidates.filter((item) => typeof item.score !== 'number' || item.score >= SCORE_THRESHOLD)
    }

    console.log(`RAG: retrieved ${results.length} candidate chunks for question: "${question}"`)
    if (results.length) {
        console.log('RAG: scores:', results.map(r => r.score))
    }

    const filtered = results.filter((item) => {
        return typeof item.score !== "number" || item.score >= SCORE_THRESHOLD
    })

    // If nothing meets the threshold, fall back to returning the top candidates
    if (!filtered.length) {
        console.log('RAG: no chunks passed the similarity threshold — returning top candidates as fallback')
        return results.slice(0, TOP_K)
    }

    return filtered
}
module.exports = { retrieveRelevantChunks }