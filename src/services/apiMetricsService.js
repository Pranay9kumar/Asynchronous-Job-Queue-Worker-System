const { MetricSnapshotModel } = require('../models/metricSnapshotModel');

const rollingEvents = [];
const ROLLING_WINDOW_MS = 60 * 1000;

function pruneEvents(now = Date.now()) {
  while (rollingEvents.length && now - rollingEvents[0].timestamp > ROLLING_WINDOW_MS) {
    rollingEvents.shift();
  }
}

async function recordApiRequest({ method, path, statusCode, durationMs, requestId }) {
  const now = Date.now();
  rollingEvents.push({
    timestamp: now,
    method,
    path,
    statusCode,
    durationMs,
    requestId
  });

  pruneEvents(now);

  await MetricSnapshotModel.create({
    type: 'API_REQUEST',
    payload: {
      method,
      path,
      statusCode,
      durationMs,
      requestId,
      createdAt: new Date(now)
    }
  }).catch(() => undefined);
}

function getApiMetrics() {
  pruneEvents();

  const total = rollingEvents.length;
  const errorCount = rollingEvents.filter((event) => event.statusCode >= 400).length;
  const responseTimes = rollingEvents.map((event) => event.durationMs);
  const averageResponseTime = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : 0;

  return {
    requestsPerSecond: total / 60,
    averageResponseTimeMs: Number(averageResponseTime.toFixed(2)),
    errorRate: total ? Number((errorCount / total).toFixed(4)) : 0,
    totalRequests: total
  };
}

module.exports = {
  recordApiRequest,
  getApiMetrics
};