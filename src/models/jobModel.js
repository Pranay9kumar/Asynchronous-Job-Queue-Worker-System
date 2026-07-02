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
    requestId: {
      type: String,
      default: null,
      index: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'DEAD_LETTER', 'IDLE'],
      default: 'WAITING',
      index: true
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxRetries: {
      type: Number,
      required: true,
      min: 0
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
    },
    lastFailureReason: {
      type: String,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    executionStatus: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'DONE', 'FAILED'],
      default: 'PENDING'
    },
    workerId: {
      type: String,
      default: null,
      index: true
    },
    lastWorkerSeenAt: {
      type: Date,
      default: null
    },
    queueTimeMs: {
      type: Number,
      default: 0
    },
    processingTimeMs: {
      type: Number,
      default: 0
    },
    endToEndCompletionTimeMs: {
      type: Number,
      default: 0
    },
    performanceRecordedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const JobModel = mongoose.model('Job', jobSchema);

module.exports = { JobModel };
