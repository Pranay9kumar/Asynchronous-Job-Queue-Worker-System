const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['WAITING', 'ACTIVE', 'COMPLETED', 'FAILED'],
      default: 'WAITING',
      index: true
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const JobModel = mongoose.model('Job', jobSchema);

module.exports = { JobModel };
