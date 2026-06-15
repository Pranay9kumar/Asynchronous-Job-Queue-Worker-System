const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateJobRequest } = require('../middlewares/validateJobRequest');
const { createJobController, getJobController } = require('../controllers/jobController');

const router = express.Router();

router.post('/', validateJobRequest, asyncHandler(createJobController));
router.get('/:id', asyncHandler(getJobController));

module.exports = { jobRoutes: router };
