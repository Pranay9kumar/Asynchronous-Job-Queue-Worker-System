const { AlertModel } = require('../models/alertModel');
const { config } = require('../config/env');
const { JobModel } = require('../models/jobModel');
const { WorkerModel } = require('../models/workerModel');

async function createAlert({ type, severity = 'MEDIUM', message, details = {} }) {
  const existingAlert = await AlertModel.findOne({
    type,
    message,
    acknowledged: false
  }).lean();

  if (existingAlert) {
    return existingAlert;
  }

  const alert = await AlertModel.create({ type, severity, message, details });
  return alert.toObject();
}

async function getAlerts({ page = 1, limit = 20, sort = '-createdAt', filter = {} } = {}) {
  const query = AlertModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean();
  const [alerts, total] = await Promise.all([query, AlertModel.countDocuments(filter)]);
  return {
    alerts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function evaluateAlerts({ dlqCount, failureRate, activeWorkers }) {
  const alerts = [];

  if (dlqCount >= config.dlqAlertThreshold) {
    alerts.push(await createAlert({
      type: 'DLQ_THRESHOLD_EXCEEDED',
      severity: 'HIGH',
      message: 'DLQ threshold exceeded',
      details: { dlqCount, threshold: config.dlqAlertThreshold }
    }));
  }

  if (failureRate >= config.failureRateAlertThreshold) {
    alerts.push(await createAlert({
      type: 'HIGH_FAILURE_RATE',
      severity: 'HIGH',
      message: 'Failure rate is above the configured threshold',
      details: { failureRate, threshold: config.failureRateAlertThreshold }
    }));
  }

  if (activeWorkers === 0) {
    alerts.push(await createAlert({
      type: 'WORKERS_UNAVAILABLE',
      severity: 'HIGH',
      message: 'No active workers available',
      details: { activeWorkers }
    }));
  }

  return alerts;
}

async function getActiveAlertStatistics() {
  const [totalAlerts, unresolvedAlerts, highSeverityAlerts] = await Promise.all([
    AlertModel.countDocuments({}),
    AlertModel.countDocuments({ acknowledged: false }),
    AlertModel.countDocuments({ severity: 'HIGH', acknowledged: false })
  ]);

  return {
    totalAlerts,
    unresolvedAlerts,
    highSeverityAlerts
  };
}

async function getAlertContext() {
  const [dlqJobs, failedJobs, activeWorkers] = await Promise.all([
    JobModel.countDocuments({ status: 'DEAD_LETTER' }),
    JobModel.countDocuments({ status: 'FAILED' }),
    WorkerModel.countDocuments({ status: 'Busy' })
  ]);

  const totalJobs = await JobModel.countDocuments({});
  const failureRate = totalJobs ? failedJobs / totalJobs : 0;

  return {
    dlqCount: dlqJobs,
    failureRate,
    activeWorkers
  };
}

module.exports = {
  createAlert,
  getAlerts,
  evaluateAlerts,
  getActiveAlertStatistics,
  getAlertContext
};