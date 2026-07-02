const mongoose = require('mongoose');
const { connectMongo } = require('./src/config/db');
const { createApp } = require('./src/app');
const { config } = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { redisClient } = require('./src/config/redisClient');

let server;

async function startApi() {
  await connectMongo();

  const app = createApp();
  server = app.listen(config.port, () => {
    logger.info({ component: 'api', event: 'API_STARTED', port: config.port, env: config.nodeEnv }, 'API started');
  });

  return server;
}

async function shutdownApi(signal) {
  logger.info({ component: 'api', event: 'API_STOPPING', signal }, 'API stopping');

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.connection.close().catch(() => undefined);
  await redisClient.quit().catch(() => undefined);
}

startApi().catch((error) => {
  logger.error({ component: 'api', event: 'API_BOOTSTRAP_FAILED', error: error.message }, 'API bootstrap failed');
  process.exit(1);
});

process.on('SIGINT', async () => {
  await shutdownApi('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownApi('SIGTERM');
  process.exit(0);
});
