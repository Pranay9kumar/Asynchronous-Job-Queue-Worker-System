const { logger } = require('../config/logger');

function classifyError(error) {
  if (error.name === 'ValidationError') {
    return 'Validation Error';
  }

  if (error.code === 'ECONNREFUSED') {
    return 'Redis Error';
  }

  if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
    return 'MongoDB Error';
  }

  if (error.isQueueError) {
    return 'Queue Error';
  }

  if (error.isWorkerError) {
    return 'Worker Error';
  }

  return 'Application Error';
}

function observabilityErrorHandler(error, req, res, next) {
  const errorType = classifyError(error);

  logger.error(
    {
      component: 'http',
      event: 'ERROR',
      errorType,
      requestId: req.id,
      path: req.originalUrl || req.path,
      method: req.method,
      jobId: error.jobId,
      workerId: error.workerId,
      error: error.message
    },
    'Request failed'
  );

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error',
    errorType
  });
}

module.exports = { observabilityErrorHandler, classifyError };