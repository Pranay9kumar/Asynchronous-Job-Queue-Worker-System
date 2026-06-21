const { connectMongo } = require('./src/config/db');
const { createApp } = require('./src/app');
const { config } = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { initializeWorker } = require('./src/workers/jobWorker');

async function bootstrap() {
  await connectMongo();
  initializeWorker();

  const app = createApp();
  app.listen(config.port, () => {
    logger.info({ component: 'server', event: 'SERVER_STARTED', port: config.port }, 'Server started');
  });
}

bootstrap().catch((error) => {
  logger.error({ component: 'server', event: 'BOOTSTRAP_FAILED', error: error.message }, 'Fatal bootstrap error');
  process.exit(1);
});
