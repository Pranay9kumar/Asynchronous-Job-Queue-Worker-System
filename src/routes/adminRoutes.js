const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const {
  getAdminJobsController,
  getAdminWorkersController,
  getAdminAlertsController,
  getAdminStatisticsController
} = require('../controllers/adminController');

const router = express.Router();

router.get('/jobs', asyncHandler(getAdminJobsController));
router.get('/workers', asyncHandler(getAdminWorkersController));
router.get('/alerts', asyncHandler(getAdminAlertsController));
router.get('/statistics', asyncHandler(getAdminStatisticsController));

module.exports = { adminRoutes: router };