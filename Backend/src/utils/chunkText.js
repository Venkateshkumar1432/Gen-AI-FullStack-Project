function chunkText(text, chunkSize = 900, overlap = 180) {
    const normalizedText = text.replace(/\s+/g, " ").trim()

    if (!normalizedText) {
        return []
    }

    const chunks = []
    let start = 0

    while (start < normalizedText.length) {
        const end = Math.min(start + chunkSize, normalizedText.length)
        const chunk = normalizedText.slice(start, end).trim()

        if (chunk) {
            chunks.push(chunk)
        }

        if (end === normalizedText.length) {
            break
        }

        start += chunkSize - overlap
    }

    return chunks
}

module.exports = { chunkText }
