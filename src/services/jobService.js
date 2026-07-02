const { randomUUID } = require('crypto');
const { JobModel } = require('../models/jobModel');
const { jobQueue } = require('../queues/jobQueue');
const { logger } = require('../config/logger');
const { config } = require('../config/env');
const { buildIdempotencyKey, getExistingJobIdForKey, lockIdempotencyKey } = require('../config/idempotency');
const { findJobByIdempotencyKey } = require('./duplicateDetectionService');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createJob({
  type,
  payload,
  maxRetries = config.maxRetries,
  idempotencyKey: providedIdempotencyKey,
  requestId = null
}) {
  const idempotencyKey = buildIdempotencyKey(type, payload, providedIdempotencyKey);

  const existingJobId = await getExistingJobIdForKey(idempotencyKey);
  if (existingJobId) {
    const existingJob = await JobModel.findOne({ jobId: existingJobId }).lean();
    if (existingJob) {
      logger.info({ component: 'queue', event: 'DUPLICATE_JOB_SKIPPED', jobId: existingJob.jobId, idempotencyKey }, 'Duplicate job skipped');
      return existingJob;
    }
  }

  const jobId = randomUUID();

  try {
    const lockResult = await lockIdempotencyKey(idempotencyKey, jobId);
    if (!lockResult) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const existingJob = await findJobByIdempotencyKey(idempotencyKey);
        if (existingJob) {
          logger.info({ component: 'queue', event: 'DUPLICATE_JOB_SKIPPED', jobId: existingJob.jobId, idempotencyKey, requestId }, 'Duplicate job skipped');
          return existingJob;
        }

        await sleep(50);
      }

      const duplicateJobId = await getExistingJobIdForKey(idempotencyKey);
      if (duplicateJobId) {
        const existingJob = await JobModel.findOne({ jobId: duplicateJobId }).lean();
        if (existingJob) {
          logger.info({ component: 'queue', event: 'DUPLICATE_JOB_SKIPPED', jobId: existingJob.jobId, idempotencyKey, requestId }, 'Duplicate job skipped');
          return existingJob;
        }
      }

      const conflict = new Error('Duplicate job request is already being processed');
      conflict.statusCode = 409;
      conflict.name = 'ValidationError';
      throw conflict;
    }

    const jobRecord = await JobModel.create({
      jobId,
      type,
      requestId,
      idempotencyKey,
      payload,
      status: 'WAITING',
      retryCount: 0,
      maxRetries,
      executionStatus: 'PENDING'
    });

    await jobQueue.add(type, { jobId, type, payload, requestId, idempotencyKey }, { jobId, attempts: maxRetries + 1 });

    logger.info({ component: 'queue', event: 'JOB_CREATED', jobId, type, maxRetries, idempotencyKey, requestId }, 'Job Created');

    return jobRecord.toObject();
  } catch (error) {
    const duplicateJob = await findJobByIdempotencyKey(idempotencyKey);
    if (duplicateJob) {
      logger.info({ component: 'queue', event: 'DUPLICATE_JOB_SKIPPED', jobId: duplicateJob.jobId, idempotencyKey }, 'Duplicate job skipped');
      return duplicateJob;
    }

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
        executionStatus: 'RUNNING',
        workerId: null,
        failureReason: null,
        lastFailureReason: null
      }
    }
  );
}

async function assignWorkerToJob(jobId, workerId) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        workerId,
        lastWorkerSeenAt: new Date()
      }
    }
  );
}

async function markJobCompleted(jobId, performance = {}) {
  return JobModel.updateOne(
    { jobId },
    {
      $set: {
        status: 'COMPLETED',
        completedAt: new Date(),
        executionStatus: 'DONE',
        failureReason: null,
        lastFailureReason: null,
        failedAt: null,
        queueTimeMs: performance.queueTimeMs || 0,
        processingTimeMs: performance.processingTimeMs || 0,
        endToEndCompletionTimeMs: performance.endToEndCompletionTimeMs || 0,
        performanceRecordedAt: performance.performanceRecordedAt || new Date()
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
        executionStatus: 'PENDING',
        failureReason,
        lastFailureReason: failureReason,
        failedAt: null,
        workerId: null
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
        executionStatus: 'FAILED',
        failureReason,
        lastFailureReason: failureReason,
        failedAt: new Date(),
        workerId: null
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
        executionStatus: 'PENDING',
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
  assignWorkerToJob,
  markJobCompleted,
  markJobRetrying,
  markJobDeadLetter,
  resetJobForRetry
};
