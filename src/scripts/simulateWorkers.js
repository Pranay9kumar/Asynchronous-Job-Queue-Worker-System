const { connectMongo } = require('../config/db');
const { createJob } = require('../services/jobService');

async function run() {
  await connectMongo();

  const jobs = Array.from({ length: 20 }, (_, index) =>
    createJob({
      type: 'email',
      payload: { to: `worker${index}@example.com` }
    })
  );

  await Promise.all(jobs);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});