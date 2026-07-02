const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const {
  getMetricsController,
  getJobsMetricsController,
  getQueueMetricsController
} = require('../controllers/metricsController');
const { getWorkerMetricsController } = require('../controllers/workerController');

const router = express.Router();

router.get('/', asyncHandler(getMetricsController));
router.get('/jobs', asyncHandler(getJobsMetricsController));
router.get('/workers', asyncHandler(getWorkerMetricsController));
router.get('/queue', asyncHandler(getQueueMetricsController));

module.exports = { metricsRoutes: router };