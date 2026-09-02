// Wraps a Zod schema into an Express middleware.
// On success, replaces req.body with the parsed (and coerced) data.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data;
  next();
};
