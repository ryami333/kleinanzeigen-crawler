import "dotenv/config"; // Only needed for local dev.
import { sendNotification } from "./sendNotification.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";
import { processJob } from "./processJob.mjs";

await sendNotification({
  subject: "Crawler is live",
  html: `<p>Crawler started at ${new Date().toLocaleString()}</p>`,
});

crawlerQueue.on("active", function (job) {
  console.error(`Job ${job.id} started at ${new Date().toLocaleString()}`);
});

crawlerQueue.on("completed", (job) => {
  console.error(`Job ${job.id} completed at ${new Date().toLocaleString()}`);
});

crawlerQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed at ${new Date().toLocaleString()}`);
  console.error("Error:", err);
  process.exit(1);
});

crawlerQueue.process(processJob);

/**
 * Start by setting a baseline so that we don't get emailed about all of the
 * _existing_ results.
 */
crawlerQueue.add(
  { sendNotifications: false },
  {
    attempts: 3,
  },
);

crawlerQueue.add(
  { sendNotifications: true },
  {
    attempts: 3,
    repeat: { cron: "*/5 * * * *" /* Every 5 minutes */ },
  },
);
