const { connectMongo } = require('../config/db');
const { createJob } = require('../services/jobService');

async function run() {
  await connectMongo();

  const payload = { to: 'duplicate@example.com' };
  const idempotencyKey = 'duplicate-demo-key';

  await Promise.all([
    createJob({ type: 'email', payload, idempotencyKey }),
    createJob({ type: 'email', payload, idempotencyKey })
  ]);

  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});