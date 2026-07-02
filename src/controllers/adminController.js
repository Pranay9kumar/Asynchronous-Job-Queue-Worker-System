const { JobModel } = require('../models/jobModel');
const { WorkerModel } = require('../models/workerModel');
const { AlertModel } = require('../models/alertModel');
const { MetricSnapshotModel } = require('../models/metricSnapshotModel');
const { getAdminStatistics } = require('../services/metricsService');

function buildPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const sort = query.sort || '-createdAt';
  return { page, limit, sort };
}

async function getAdminJobsController(req, res) {
  const { page, limit, sort } = buildPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.workerId) {
    filter.workerId = req.query.workerId;
  }

  if (req.query.idempotencyKey) {
    filter.idempotencyKey = req.query.idempotencyKey;
  }

  const [jobs, total] = await Promise.all([
    JobModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    JobModel.countDocuments(filter)
  ]);

  return res.status(200).json({
    jobs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}

async function getAdminWorkersController(req, res) {
  const { page, limit, sort } = buildPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [workers, total] = await Promise.all([
    WorkerModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    WorkerModel.countDocuments(filter)
  ]);

  return res.status(200).json({
    workers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}

async function getAdminAlertsController(req, res) {
  const { page, limit, sort } = buildPagination(req.query);
  const filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.acknowledged !== undefined) {
    filter.acknowledged = req.query.acknowledged === 'true';
  }

  const [alerts, total] = await Promise.all([
    AlertModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    AlertModel.countDocuments(filter)
  ]);

  return res.status(200).json({
    alerts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}

async function getAdminStatisticsController(req, res) {
  const { page, limit, sort } = buildPagination(req.query);
  const stats = await getAdminStatistics();
  const [snapshots, total] = await Promise.all([
    MetricSnapshotModel.find({}).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    MetricSnapshotModel.countDocuments({})
  ]);

  return res.status(200).json({
    stats,
    snapshots,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}

module.exports = {
  getAdminJobsController,
  getAdminWorkersController,
  getAdminAlertsController,
  getAdminStatisticsController
};