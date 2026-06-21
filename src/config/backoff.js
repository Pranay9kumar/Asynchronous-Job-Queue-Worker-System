const BACKOFF_BASE_DELAY_MS = 1000;

function getExponentialBackoffDelay(retryAttempt) {
  return BACKOFF_BASE_DELAY_MS * Math.pow(2, retryAttempt - 1);
}

function getBullMqBackoffConfig() {
  return {
    type: 'exponential',
    delay: BACKOFF_BASE_DELAY_MS
  };
}

module.exports = {
  BACKOFF_BASE_DELAY_MS,
  getExponentialBackoffDelay,
  getBullMqBackoffConfig
};