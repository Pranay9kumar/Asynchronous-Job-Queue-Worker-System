const { createJob, getJobById } = require('../services/jobService');

async function createJobController(req, res) {
  const { type, payload } = req.body;
  const job = await createJob({ type, payload });

  return res.status(201).json({ jobId: job.jobId });
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
