const express = require('express');
const pinoHttp = require('pino-http');
const { logger } = require('./config/logger');
const { jobRoutes } = require('./routes/jobRoutes');
const { dlqRoutes } = require('./routes/dlqRoutes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({
        requestId: req.id
      })
    })
  );

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/jobs', jobRoutes);
  app.use('/dlq', dlqRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
