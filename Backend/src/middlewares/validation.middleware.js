function validateRequest(schema) {
    return (req, res, next) => {
        const result = schema.safeParse({
            ...req.body,
            ...req.params,
            ...req.query
        })

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error.errors
            })
        }

        req.validated = result.data
        next()
    }
}

module.exports = { validateRequest }
