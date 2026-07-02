const { recordApiRequest } = require('../services/apiMetricsService');

function requestMetrics(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const finishedAt = process.hrtime.bigint();
    const durationMs = Number(finishedAt - startedAt) / 1e6;

    recordApiRequest({
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      durationMs,
      requestId: req.id
    }).catch(() => undefined);
  });

  next();
}

module.exports = { requestMetrics };