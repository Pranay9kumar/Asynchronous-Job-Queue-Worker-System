const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { getDlqController, retryDlqJobController, deleteDlqJobController } = require('../controllers/dlqController');

const router = express.Router();

router.get('/', asyncHandler(getDlqController));
router.post('/:id/retry', asyncHandler(retryDlqJobController));
router.delete('/:id', asyncHandler(deleteDlqJobController));

module.exports = { dlqRoutes: router };