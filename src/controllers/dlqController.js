const { listDlqJobs, retryDlqJob } = require('../services/dlqService');

async function getDlqController(req, res) {
  const jobs = await listDlqJobs();
  return res.status(200).json({ jobs });
}

async function retryDlqJobController(req, res) {
  const job = await retryDlqJob(req.params.id);

  if (!job) {
    return res.status(404).json({ message: 'DLQ job not found' });
  }

  return res.status(200).json(job);
}

module.exports = {
  getDlqController,
  retryDlqJobController
};