const { logger } = require('../config/logger');
const { deadLetterQueue } = require('../queues/dlqQueue');
const { recordRetryState } = require('./retryService');
const { getExponentialBackoffDelay } = require('../config/backoff');
const { evaluateAlerts, getAlertContext } = require('./alertService');

async function handleJobFailure(job, error) {
  const retryState = await recordRetryState(job, error.message);

  const alertContext = await getAlertContext().catch(() => null);
  if (alertContext) {
    await evaluateAlerts(alertContext).catch(() => undefined);
  }

  if (retryState.status === 'DEAD_LETTER') {
    await deadLetterQueue.add(
      'dead-letter-job',
      {
        originalJobId: job.data.jobId,
        failureReason: error.message,
        retryCount: retryState.retryCount,
        payload: job.data.payload,
        failedAt: new Date().toISOString()
      },
      { jobId: job.data.jobId }
    );

    logger.error(
      {
        component: 'worker',
        event: 'JOB_MOVED_TO_DLQ',
        jobId: job.data.jobId,
        type: job.data.type,
        requestId: job.data.requestId,
        retryCount: retryState.retryCount,
        error: error.message
      },
      'Job moved to DLQ'
    );

    return retryState;
  }

  logger.warn(
    {
      component: 'worker',
      event: 'JOB_RETRYING',
      jobId: job.data.jobId,
      type: job.data.type,
      requestId: job.data.requestId,
      retryCount: retryState.retryCount,
      nextRetryDelayMs: getExponentialBackoffDelay(retryState.retryCount),
      error: error.message
    },
    'Job retry scheduled'
  );

  return retryState;
}

module.exports = { handleJobFailure };