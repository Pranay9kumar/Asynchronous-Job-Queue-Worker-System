const { Worker } = require('bullmq');
const { config } = require('../config/env');
const { logger } = require('../config/logger');
const { connection } = require('../queues/jobQueue');
const { markJobActive, markJobCompleted, markJobFailed } = require('../services/jobService');

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
      await markJobActive(job.data.jobId);
      logger.info({ component: 'worker', event: 'job_started', jobId: job.data.jobId, type: job.data.type }, 'Job Started');

      await delay(config.jobProcessingDelayMs);

      await markJobCompleted(job.data.jobId);
      logger.info({ component: 'worker', event: 'job_completed', jobId: job.data.jobId, type: job.data.type }, 'Job Completed');

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

    await markJobFailed(job.data.jobId, error.message).catch(() => undefined);

    logger.error(
      {
        component: 'worker',
        event: 'job_failed',
        jobId: job.data.jobId,
        type: job.data.type,
        error: error.message
      },
      'Job Failed'
    );
  });

  return workerInstance;
}

module.exports = { initializeWorker };
