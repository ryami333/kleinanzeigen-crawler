import Queue from "bull";
import { BULL_QUEUE_KEY } from "./constants.mjs";
import { processJob } from "./processJob.mjs";

/**
 * @type {Queue.Queue<{ sendNotifications: boolean }>} crawlerQueue
 */
export const crawlerQueue = new Queue(
  BULL_QUEUE_KEY,
  `redis://localhost:6379`,
  {
    defaultJobOptions: {
      attempts: 10,
      backoff: {
        /**
         * With exponential backoff, the delay (in milliseconds is computed) as:
         * 2 ^ (attempts - 1) * delay
         */
        type: "exponential",
        delay: 1000,
      },
    },
  },
);

crawlerQueue.on("active", function (job) {
  console.error(`Job ${job.id} started at ${new Date().toLocaleString()}`);
});

crawlerQueue.on("completed", (job) => {
  console.error(`Job ${job.id} completed at ${new Date().toLocaleString()}`);
});

crawlerQueue.on("failed", (job, err) => {
  const attemptsMade = job.attemptsMade;
  const maxAttempts = job.opts.attempts ?? 1;
  const remainingAttempts = maxAttempts - attemptsMade;

  console.error(
    `Job ${job.id} failed at ${new Date().toLocaleString()}`,
    "Error:",
    err,
    `Remaining Attempts: ${remainingAttempts}`,
  );

  if (remainingAttempts === 0) {
    process.exit(1);
  }
});

crawlerQueue.process(processJob);
