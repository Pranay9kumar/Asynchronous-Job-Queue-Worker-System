const mongoose = require('mongoose');
const { connectMongo } = require('./src/config/db');
const { config } = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { initializeWorker, stopWorker } = require('./src/workers/jobWorker');
const { redisClient } = require('./src/config/redisClient');

async function startWorker() {
  await connectMongo();
  initializeWorker();
  logger.info({ component: 'worker', event: 'WORKER_PROCESS_STARTED', workerId: config.workerId }, 'Worker process started');
}

async function shutdownWorker(signal) {
  logger.info({ component: 'worker', event: 'WORKER_PROCESS_STOPPING', signal, workerId: config.workerId }, 'Worker process stopping');
  await stopWorker().catch(() => undefined);
  await mongoose.connection.close().catch(() => undefined);
  await redisClient.quit().catch(() => undefined);
}

startWorker().catch((error) => {
  logger.error({ component: 'worker', event: 'WORKER_PROCESS_BOOTSTRAP_FAILED', error: error.message }, 'Worker bootstrap failed');
  process.exit(1);
});

process.on('SIGINT', async () => {
  await shutdownWorker('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownWorker('SIGTERM');
  process.exit(0);
});
