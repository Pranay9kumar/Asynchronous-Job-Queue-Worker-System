const { config } = require('../config/env');
const { connectMongo } = require('../config/db');
const { createJob } = require('../services/jobService');

async function run() {
  await connectMongo();

  const jobs = Array.from({ length: 100 }, (_, index) =>
    createJob({
      type: 'email',
      payload: { to: `user${index}@example.com` }
    })
  );

  await Promise.all(jobs);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});