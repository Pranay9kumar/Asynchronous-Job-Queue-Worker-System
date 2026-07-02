const { deadLetterQueue } = require('../queues/dlqQueue');
const { JobModel } = require('../models/jobModel');
const { jobQueue } = require('../queues/jobQueue');
const { prepareJobForRequeue } = require('./retryService');

async function listDlqJobs() {
  return JobModel.find({ status: 'DEAD_LETTER' }).sort({ failedAt: -1 }).lean();
}

async function removeQueuedJob(queue, jobId) {
  const queuedJob = await queue.getJob(jobId);

  if (queuedJob) {
    await queuedJob.remove();
  }
}

async function retryDlqJob(jobId) {
  const job = await JobModel.findOne({ jobId, status: 'DEAD_LETTER' });

  if (!job) {
    return null;
  }

  await removeQueuedJob(deadLetterQueue, jobId);
  await removeQueuedJob(jobQueue, jobId);
  await prepareJobForRequeue(jobId);

  await jobQueue.add(job.type, { jobId, type: job.type, payload: job.payload }, { jobId, attempts: job.maxRetries + 1 });

  return JobModel.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: 'WAITING',
        retryCount: 0,
        failedAt: null,
        failureReason: null,
        lastFailureReason: null
      },
      $unset: {
        completedAt: ''
      }
    },
    { new: true }
  ).lean();
}

async function deleteDlqJob(jobId) {
  const job = await JobModel.findOneAndDelete({ jobId, status: 'DEAD_LETTER' }).lean();
  if (!job) {
    return null;
  }

  await removeQueuedJob(deadLetterQueue, jobId).catch(() => undefined);
  return job;
}

module.exports = {
  listDlqJobs,
  retryDlqJob,
  deleteDlqJob
};