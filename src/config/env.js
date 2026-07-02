require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

require('dotenv').config({ path: `.env.${nodeEnv}` });

const config = {
  nodeEnv,
  port: Number(process.env.PORT || 3000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job_queue',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  queueName: process.env.QUEUE_NAME || 'jobs',
  deadLetterQueueName: process.env.DLQ_QUEUE_NAME || 'dead-letter-queue',
  maxRetries: Number(process.env.MAX_RETRY_ATTEMPTS || 4),
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY || 3),
  workerId: process.env.WORKER_ID || `worker-${process.pid}`,
  rateLimitMaxJobsPerMinute: Number(process.env.RATE_LIMIT_MAX_JOBS_PER_MINUTE || 100),
  dlqAlertThreshold: Number(process.env.DLQ_ALERT_THRESHOLD || 10),
  failureRateAlertThreshold: Number(process.env.FAILURE_RATE_ALERT_THRESHOLD || 0.5),
  allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim()),
  apiDocsEnabled: process.env.API_DOCS_ENABLED !== 'false',
  jobProcessingDelayMs: Number(process.env.JOB_PROCESSING_DELAY_MS || 3000),
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = { config };
