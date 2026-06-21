const { Worker } = require('bullmq');
const { config } = require('../config/env');
const { logger } = require('../config/logger');
const { connection } = require('../queues/jobQueue');
const { markJobActive, markJobCompleted } = require('../services/jobService');
const { handleJobFailure } = require('../services/failureHandler');

let workerInstance = null;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function initializeWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  const workerConnection = connection.duplicate();

  workerInstance = new Worker(
    config.queueName,
    async (job) => {
      await markJobActive(job.data.jobId, job.attemptsMade || 0);
      logger.info(
        { component: 'worker', event: 'JOB_STARTED', jobId: job.data.jobId, type: job.data.type, retryCount: job.attemptsMade || 0 },
        'Job Started'
      );

      if (job.data.payload && job.data.payload.simulateFailure) {
        throw new Error('Simulated job failure');
      }

      await delay(config.jobProcessingDelayMs);

      await markJobCompleted(job.data.jobId);
      logger.info({ component: 'worker', event: 'JOB_COMPLETED', jobId: job.data.jobId, type: job.data.type }, 'Job Completed');

      return { processed: true };
    },
    {
      connection: workerConnection,
      concurrency: 1
    }
  );

  workerInstance.on('failed', async (job, error) => {
    if (!job) {
      return;
    }

    await handleJobFailure(job, error).catch(() => undefined);

    logger.error(
      {
        component: 'worker',
        event: 'JOB_FAILED',
        jobId: job.data.jobId,
        type: job.data.type,
        retryCount: job.attemptsMade || 0,
        error: error.message
      },
      'Job Failed'
    );
  });

  return workerInstance;
}

module.exports = { initializeWorker };
