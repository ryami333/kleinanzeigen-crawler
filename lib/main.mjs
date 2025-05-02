import "dotenv/config"; // Only needed for local dev.
import { crawlerQueue } from "./crawlerQueue.mjs";
import { notificationQueue } from "./notificationQueue.mjs";
import express from "express";
import { router } from "./router.mjs";

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
const port = 5555;

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
