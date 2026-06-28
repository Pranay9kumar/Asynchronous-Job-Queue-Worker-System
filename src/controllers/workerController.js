const { listWorkers, getWorkerMetrics } = require('../services/workerService');

async function getWorkersController(req, res) {
  const workers = await listWorkers();
  return res.status(200).json({ workers });
}

async function getWorkerMetricsController(req, res) {
  const metrics = await getWorkerMetrics();
  return res.status(200).json(metrics);
}

module.exports = {
  getWorkersController,
  getWorkerMetricsController
};