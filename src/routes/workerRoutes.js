const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { getWorkersController, getWorkerMetricsController } = require('../controllers/workerController');

const router = express.Router();

router.get('/', asyncHandler(getWorkersController));

module.exports = { workerRoutes: router };