const { randomUUID } = require('crypto');
const { JobModel } = require('../models/jobModel');
const { jobQueue } = require('../queues/jobQueue');
const { logger } = require('../config/logger');

async function createJob({ type, payload }) {
  const jobId = randomUUID();

  try {
    const jobRecord = await JobModel.create({
      jobId,
      type,
      payload,
      status: 'WAITING'
    });

    await jobQueue.add(type, { jobId, type, payload }, { jobId });

    logger.info({ component: 'queue', event: 'job_created', jobId, type }, 'Job Created');

    return jobRecord.toObject();
  } catch (error) {
    await JobModel.updateOne(
      { jobId },
      {
        $set: {
          status: 'FAILED',
          failureReason: error.message,
          completedAt: new Date()
        }
      }
    ).catch(() => undefined);

    logger.error({ component: 'queue', event: 'job_create_failed', jobId, type, error: error.message }, 'Job Failed');
    throw error;
  }
}

async function getJobById(jobId) {
  const job = await JobModel.findOne({ jobId }).lean();
  return job;
}

async function markJobActive(jobId) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'ACTIVE',
        startedAt: new Date(),
        failureReason: null
      }
    }
  );
}

async function markJobCompleted(jobId) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    }
  );
}

async function markJobFailed(jobId, failureReason) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'FAILED',
        completedAt: new Date(),
        failureReason
      }
    }
  );
}

module.exports = {
  createJob,
  getJobById,
  markJobActive,
  markJobCompleted,
  markJobFailed
};
