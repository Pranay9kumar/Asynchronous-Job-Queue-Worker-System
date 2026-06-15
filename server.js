const { connectMongo } = require('./src/config/db');
const { createApp } = require('./src/app');
const { config } = require('./src/config/env');
const { initializeWorker } = require('./src/workers/jobWorker');

async function bootstrap() {
  await connectMongo();
  initializeWorker();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Server started',
      port: config.port
    }));
  });
}

bootstrap().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Fatal bootstrap error',
    error: error.message
  }));
  process.exit(1);
});
