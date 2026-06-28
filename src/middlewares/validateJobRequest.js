function validateJobRequest(req, res, next) {
  const { type, payload, idempotencyKey } = req.body || {};

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ message: 'type is required and must be a string' });
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ message: 'payload is required and must be an object' });
  }

  if (idempotencyKey !== undefined && typeof idempotencyKey !== 'string') {
    return res.status(400).json({ message: 'idempotencyKey must be a string when provided' });
  }

  return next();
}

module.exports = { validateJobRequest };
