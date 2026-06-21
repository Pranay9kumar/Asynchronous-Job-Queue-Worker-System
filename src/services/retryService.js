const { config } = require('../config/env');
const { getExponentialBackoffDelay } = require('../config/backoff');
const {
  markJobRetrying,
  markJobDeadLetter,
  resetJobForRetry
} = require('./jobService');

function getRetryCount(job) {
  return Math.min(job.attemptsMade || 0, config.maxRetries);
}

function isRetryExhausted(job) {
  return (job.attemptsMade || 0) >= config.maxRetries + 1;
}

async function recordRetryState(job, failureReason) {
  const retryCount = getRetryCount(job);

  if (isRetryExhausted(job)) {
    await markJobDeadLetter(job.data.jobId, failureReason, retryCount);
    return {
      status: 'DEAD_LETTER',
      retryCount
    };
  }

  await markJobRetrying(job.data.jobId, failureReason, retryCount);
  return {
    status: 'WAITING',
    retryCount,
    nextRetryDelayMs: getExponentialBackoffDelay(retryCount)
  };
}

async function prepareJobForRequeue(jobId) {
  await resetJobForRetry(jobId);
}

module.exports = {
  getRetryCount,
  isRetryExhausted,
  recordRetryState,
  prepareJobForRequeue
};