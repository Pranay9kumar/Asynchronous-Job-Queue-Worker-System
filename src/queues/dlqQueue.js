const { Queue } = require('bullmq');
const { connection } = require('./jobQueue');
const { config } = require('../config/env');

const deadLetterQueue = new Queue(config.deadLetterQueueName, {
  connection,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false
  }
});

module.exports = { deadLetterQueue };