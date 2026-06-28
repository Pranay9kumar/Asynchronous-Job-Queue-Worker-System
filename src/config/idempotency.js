const crypto = require('crypto');
const { redisClient } = require('./redisClient');

function buildIdempotencyKey(type, payload, providedKey) {
  if (providedKey) {
    return providedKey;
  }

  return crypto.createHash('sha256').update(JSON.stringify({ type, payload })).digest('hex');
}

async function lockIdempotencyKey(idempotencyKey, jobId) {
  return redisClient.set(`idem:${idempotencyKey}`, jobId, 'NX', 'EX', 24 * 60 * 60);
}

async function getExistingJobIdForKey(idempotencyKey) {
  return redisClient.get(`idem:${idempotencyKey}`);
}

module.exports = {
  buildIdempotencyKey,
  lockIdempotencyKey,
  getExistingJobIdForKey
};