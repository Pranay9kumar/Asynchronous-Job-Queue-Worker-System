const mongoose = require('mongoose');
const { config } = require('./env');
const { logger } = require('./logger');

async function connectMongo() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongodbUri, {
    autoIndex: true
  });

  logger.info({ component: 'database', event: 'connected' }, 'MongoDB connected');
}

module.exports = { connectMongo };
