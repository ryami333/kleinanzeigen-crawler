import "dotenv/config"; // Only needed for local dev.
import { searchLatestResults } from "./searchLatestResults.mjs";
import Queue from "bull";
import { getRedisClient } from "./getRedisClient.mjs";
import { sendNotification } from "./sendNotification.mjs";
import { env } from "./env.mjs";
import { randomBytes } from "node:crypto";

const PROCESSED_IDS_SET = "processed-ids";

/**
 * @type {Queue.Queue<{ sendNotifications: boolean }>} crawlerQueue
 */
const crawlerQueue = new Queue(
  randomBytes(4).toString("hex"),
  `redis://${env.REDIS_HOST}:6379`,
);

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

crawlerQueue.process(async function (job) {
  const client = await getRedisClient();

  for (const query of env.QUERIES) {
    const results = await searchLatestResults({ query });

    for (const result of results) {
      if (result.id) {
        const alreadyProcessed = await client.sIsMember(
          PROCESSED_IDS_SET,
          result.id,
        );

        if (!alreadyProcessed) {
          console.log("New listing found:", result);

          const url = new URL(
            result.href ?? "/",
            "https://www.kleinanzeigen.de/",
          );

          if (job.data.sendNotifications) {
            sendNotification({
              subject: `New search result for ${JSON.stringify(query)} – ${JSON.stringify(result.heading)}`,
              html: [
                `<p>New search result found:</p>`,
                `<p><strong><em>${result.heading}</strong></em></p>`,
                `<p>${result.description}</p>`,
                `<p>${result.price}</p>`,
                `<p>Click <a href="${url.toString()}">here</a> to see the listing.</p>`,
              ].join("\n"),
            });
          }
        }

        await client.sAdd(PROCESSED_IDS_SET, result.id);
      }
    }
  }

  await client.quit();

  /**
   * Needs to return *something* for Bull to consider this job successful.
   */
  return { success: true };
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
