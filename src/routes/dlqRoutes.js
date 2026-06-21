const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { getDlqController, retryDlqJobController } = require('../controllers/dlqController');

const router = express.Router();

router.get('/', asyncHandler(getDlqController));
router.post('/:id/retry', asyncHandler(retryDlqJobController));

module.exports = { dlqRoutes: router };