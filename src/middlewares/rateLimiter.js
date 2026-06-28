const { redisClient } = require('../config/redisClient');
const { config } = require('../config/env');

async function rateLimiter(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const minuteBucket = Math.floor(Date.now() / 60000);
  const key = `rate:${clientIp}:${minuteBucket}`;
  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.expire(key, 70);
  }

  if (count > config.rateLimitMaxJobsPerMinute) {
    return res.status(429).json({ message: 'Rate limit exceeded' });
  }

  return next();
}

module.exports = { rateLimiter };