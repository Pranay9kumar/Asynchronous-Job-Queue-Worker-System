const { randomUUID } = require('crypto');
const { JobModel } = require('../models/jobModel');
const { jobQueue } = require('../queues/jobQueue');
const { logger } = require('../config/logger');
const { config } = require('../config/env');

async function createJob({ type, payload, maxRetries = config.maxRetries }) {
  const jobId = randomUUID();

  try {
    const jobRecord = await JobModel.create({
      jobId,
      type,
      payload,
      status: 'WAITING',
      retryCount: 0,
      maxRetries
    });

    await jobQueue.add(type, { jobId, type, payload }, { jobId, attempts: maxRetries + 1 });

    logger.info({ component: 'queue', event: 'JOB_CREATED', jobId, type, maxRetries }, 'Job Created');

    return jobRecord.toObject();
  } catch (error) {
    await JobModel.updateOne(
      { jobId },
      {
        $set: {
          status: 'FAILED',
          retryCount: 0,
          failureReason: error.message,
          lastFailureReason: error.message,
          failedAt: new Date()
        }
      }
    ).catch(() => undefined);

    logger.error({ component: 'queue', event: 'JOB_FAILED', jobId, type, error: error.message }, 'Job Failed');
    throw error;
  }
}

async function getJobById(jobId) {
  const job = await JobModel.findOne({ jobId }).lean();
  return job;
}

async function markJobActive(jobId, retryCount = 0) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'ACTIVE',
        startedAt: new Date(),
        retryCount,
        failureReason: null,
        lastFailureReason: null
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
        completedAt: new Date(),
        failureReason: null,
        lastFailureReason: null,
        failedAt: null
      }
    }
  );
}

async function markJobRetrying(jobId, failureReason, retryCount) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'WAITING',
        retryCount,
        failureReason,
        lastFailureReason: failureReason,
        failedAt: null
      }
    }
  );
}

async function markJobDeadLetter(jobId, failureReason, retryCount) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'DEAD_LETTER',
        retryCount,
        failureReason,
        lastFailureReason: failureReason,
        failedAt: new Date()
      }
    }
  );
}

async function resetJobForRetry(jobId) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'WAITING',
        retryCount: 0,
        startedAt: null,
        completedAt: null,
        failedAt: null,
        failureReason: null,
        lastFailureReason: null
      }
    }
  );
}

module.exports = {
  createJob,
  getJobById,
  markJobActive,
  markJobCompleted,
  markJobRetrying,
  markJobDeadLetter,
  resetJobForRetry
};
