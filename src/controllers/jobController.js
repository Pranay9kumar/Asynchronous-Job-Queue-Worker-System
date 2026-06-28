const { createJob, getJobById } = require('../services/jobService');
const { config } = require('../config/env');

async function createJobController(req, res) {
  const { type, payload, maxRetries, idempotencyKey } = req.body;
  const job = await createJob({ type, payload, maxRetries: maxRetries ?? config.maxRetries, idempotencyKey });

  return res.status(job.status === 'WAITING' && job.executionStatus === 'PENDING' ? 201 : 200).json(job);
}

async function getJobController(req, res) {
  const job = await getJobById(req.params.id);

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.status(200).json(job);
}

module.exports = {
  createJobController,
  getJobController
};
