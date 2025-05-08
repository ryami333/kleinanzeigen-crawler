import "dotenv/config"; // Only needed for local dev.
import { crawlerQueue } from "./crawlerQueue.mjs";
import { notificationQueue } from "./notificationQueue.mjs";
import express from "express";
import { router } from "./router.mjs";
import { env } from "./env.mjs";

notificationQueue.add({
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

const app = express();

app.use(router);

app.listen(env.PORT, (req) => {
  console.log(`App listening on port ${env.PORT}`);
});
