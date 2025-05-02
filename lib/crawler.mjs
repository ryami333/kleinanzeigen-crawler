import "dotenv/config"; // Only needed for local dev.
import { sendNotification } from "./sendNotification.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";

await sendNotification({
  subject: "Crawler is live",
  html: `<p>Crawler started at ${new Date().toLocaleString()}</p>`,
});

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
