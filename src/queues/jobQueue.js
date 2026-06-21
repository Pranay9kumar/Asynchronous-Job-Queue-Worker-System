const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const { config } = require('../config/env');
const { getBullMqBackoffConfig } = require('../config/backoff');

const connection = new IORedis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  maxRetriesPerRequest: null
});

const jobQueue = new Queue(config.queueName, {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: config.maxRetries + 1,
    backoff: getBullMqBackoffConfig()
  }
});

module.exports = { jobQueue, connection };
