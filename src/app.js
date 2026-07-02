const express = require('express');
const pinoHttp = require('pino-http');
const { logger } = require('./config/logger');
const { jobRoutes } = require('./routes/jobRoutes');
const { dlqRoutes } = require('./routes/dlqRoutes');
const { workerRoutes } = require('./routes/workerRoutes');
const { metricsRoutes } = require('./routes/metricsRoutes');
const { adminRoutes } = require('./routes/adminRoutes');
const { healthRoutes } = require('./routes/healthRoutes');
const { rateLimiter } = require('./middlewares/rateLimiter');
const { requestMetrics } = require('./middlewares/requestMetrics');
const { notFound } = require('./middlewares/notFound');
const { observabilityErrorHandler } = require('./middlewares/observabilityErrorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(rateLimiter);
  app.use(requestMetrics);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({
        requestId: req.id
      })
    })
  );

  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.info(
        {
          component: 'http',
          event: 'API_REQUEST',
          requestId: req.id,
          method: req.method,
          path: req.originalUrl || req.path,
          statusCode: res.statusCode
        },
        'API request completed'
      );
    });

    next();
  });

  app.use('/jobs', jobRoutes);
  app.use('/dlq', dlqRoutes);
  app.use('/workers', workerRoutes);
  app.use('/metrics', metricsRoutes);
  app.use('/admin', adminRoutes);
  app.use('/health', healthRoutes);

  app.use(notFound);
  app.use(observabilityErrorHandler);

  return app;
}

module.exports = { createApp };
