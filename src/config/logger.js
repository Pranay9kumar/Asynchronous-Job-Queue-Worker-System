const pino = require('pino');
const { config } = require('./env');

const logger = pino({
  level: config.logLevel,
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = { logger };
