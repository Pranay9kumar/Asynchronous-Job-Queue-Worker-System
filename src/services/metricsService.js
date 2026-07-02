const { jobQueue } = require('../queues/jobQueue');
const { getApiMetrics } = require('./apiMetricsService');
const { getWorkerMetrics } = require('./workerService');
const { getSystemHealth } = require('./healthService');
const { getPerformanceStatistics } = require('./performanceService');
const { JobModel } = require('../models/jobModel');
const { evaluateAlerts, getAlertContext, getActiveAlertStatistics } = require('./alertService');

async function getQueueMetrics() {
  return jobQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
}

async function getJobMetrics() {
  const [queueMetrics, performanceMetrics, health] = await Promise.all([
    getQueueMetrics(),
    getPerformanceStatistics(),
    getSystemHealth()
  ]);

  return {
    queueMetrics,
    performanceMetrics,
    health
  };
}

async function getMetricsDashboard() {
  const [queueMetrics, workerMetrics, apiMetrics, performanceMetrics, health, alertContext, alertStats] = await Promise.all([
    getQueueMetrics(),
    getWorkerMetrics(),
    getApiMetrics(),
    getPerformanceStatistics(),
    getSystemHealth(),
    getAlertContext(),
    getActiveAlertStatistics()
  ]);

  await evaluateAlerts(alertContext).catch(() => undefined);

  return {
    queueMetrics,
    workerMetrics,
    apiMetrics,
    performanceMetrics,
    health,
    alerts: alertStats
  };
}

async function getAdminStatistics() {
  const [totalJobs, completedJobs, failedJobs, deadLetterJobs] = await Promise.all([
    JobModel.countDocuments({}),
    JobModel.countDocuments({ status: 'COMPLETED' }),
    JobModel.countDocuments({ status: 'FAILED' }),
    JobModel.countDocuments({ status: 'DEAD_LETTER' })
  ]);

  return {
    totalJobs,
    completedJobs,
    failedJobs,
    deadLetterJobs
  };
}

module.exports = {
  getQueueMetrics,
  getJobMetrics,
  getMetricsDashboard,
  getAdminStatistics
};