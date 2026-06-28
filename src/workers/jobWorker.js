const { Worker } = require('bullmq');
const { config } = require('../config/env');
const { logger } = require('../config/logger');
const { jobQueue } = require('../queues/jobQueue');
const { markJobActive, markJobCompleted } = require('../services/jobService');
const { handleJobFailure } = require('../services/failureHandler');
const { upsertWorker, setWorkerBusy, setWorkerIdle, markWorkerOffline, incrementWorkerProcessed } = require('../services/workerService');
const { redisClient } = require('../config/redisClient');

let workerInstance = null;
let workerStatusTimer = null;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function initializeWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  const workerConnection = redisClient.duplicate();

  upsertWorker(config.workerId, config.workerConcurrency).catch(() => undefined);

  workerInstance = new Worker(
    config.queueName,
    async (job) => {
      await setWorkerBusy(config.workerId).catch(() => undefined);
      logger.info(
        { component: 'worker', event: 'JOB_ASSIGNED', workerId: config.workerId, jobId: job.data.jobId, type: job.data.type },
        'Job assigned to worker'
      );

      await markJobActive(job.data.jobId, job.attemptsMade || 0);
      logger.info(
        { component: 'worker', event: 'JOB_STARTED', workerId: config.workerId, jobId: job.data.jobId, type: job.data.type, retryCount: job.attemptsMade || 0 },
        'Job Started'
      );

      if (job.data.payload && job.data.payload.simulateFailure) {
        throw new Error('Simulated job failure');
      }

      await delay(config.jobProcessingDelayMs);

      await markJobCompleted(job.data.jobId);
      await incrementWorkerProcessed(config.workerId).catch(() => undefined);
      await setWorkerIdle(config.workerId).catch(() => undefined);

      logger.info(
        { component: 'worker', event: 'JOB_COMPLETED', workerId: config.workerId, jobId: job.data.jobId, type: job.data.type },
        'Job Completed'
      );

      return { processed: true };
    },
    {
      connection: workerConnection,
      concurrency: config.workerConcurrency
    }
  );

  workerStatusTimer = setInterval(() => {
    upsertWorker(config.workerId, config.workerConcurrency).catch(() => undefined);
  }, 30000);

  workerInstance.on('closed', async () => {
    await markWorkerOffline(config.workerId).catch(() => undefined);
    logger.info({ component: 'worker', event: 'WORKER_STOPPED', workerId: config.workerId }, 'Worker stopped');
  });

  workerInstance.on('error', async () => {
    await markWorkerOffline(config.workerId).catch(() => undefined);
  });

  logger.info({ component: 'worker', event: 'WORKER_STARTED', workerId: config.workerId, concurrency: config.workerConcurrency }, 'Worker started');

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

async function stopWorker() {
  if (workerStatusTimer) {
    clearInterval(workerStatusTimer);
    workerStatusTimer = null;
  }

  if (workerInstance) {
    await markWorkerOffline(config.workerId).catch(() => undefined);
    await workerInstance.close();
    workerInstance = null;
  }
}

module.exports = { initializeWorker, stopWorker };
