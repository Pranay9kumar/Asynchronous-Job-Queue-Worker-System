const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { getHealthController } = require('../controllers/healthController');

const router = express.Router();

router.get('/', asyncHandler(getHealthController));

module.exports = { healthRoutes: router };