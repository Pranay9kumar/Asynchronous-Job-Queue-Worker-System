const { getMetricsDashboard, getJobMetrics, getQueueMetrics } = require('../services/metricsService');

async function getMetricsController(req, res) {
  const metrics = await getMetricsDashboard();
  return res.status(200).json(metrics);
}

async function getJobsMetricsController(req, res) {
  const metrics = await getJobMetrics();
  return res.status(200).json(metrics);
}

async function getQueueMetricsController(req, res) {
  const metrics = await getQueueMetrics();
  return res.status(200).json(metrics);
}

module.exports = {
  getMetricsController,
  getJobsMetricsController,
  getQueueMetricsController
};