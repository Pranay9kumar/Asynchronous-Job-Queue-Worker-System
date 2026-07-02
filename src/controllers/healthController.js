const { getSystemHealth } = require('../services/healthService');

async function getHealthController(req, res) {
  const health = await getSystemHealth();
  const statusCode = health.status === 'DOWN' ? 503 : health.status === 'DEGRADED' ? 200 : 200;

  return res.status(statusCode).json(health);
}

module.exports = { getHealthController };