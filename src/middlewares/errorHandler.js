const { logger } = require('../config/logger');

function errorHandler(error, req, res, next) {
  logger.error(
    {
      component: 'http',
      event: 'request_error',
      path: req.path,
      method: req.method,
      error: error.message
    },
    'Request failed'
  );

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error'
  });
}

module.exports = { errorHandler };
