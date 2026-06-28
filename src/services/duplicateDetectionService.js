const { JobModel } = require('../models/jobModel');

async function findJobByIdempotencyKey(idempotencyKey) {
  return JobModel.findOne({ idempotencyKey }).lean();
}

module.exports = { findJobByIdempotencyKey };