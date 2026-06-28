const IORedis = require('ioredis');
const { config } = require('./env');

const redisClient = new IORedis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  maxRetriesPerRequest: null
});

module.exports = { redisClient };