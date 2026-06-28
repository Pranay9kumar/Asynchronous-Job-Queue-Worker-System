const { Queue } = require('bullmq');
const { config } = require('../config/env');
const { getBullMqBackoffConfig } = require('../config/backoff');
const { redisClient } = require('../config/redisClient');

const jobQueue = new Queue(config.queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: config.maxRetries + 1,
    backoff: getBullMqBackoffConfig()
  }
});

module.exports = { jobQueue };
