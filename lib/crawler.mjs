import "dotenv/config"; // Only needed for local dev.
import { searchLatestResults } from "./searchLatestResults.mjs";
import Queue from "bull";
import { getRedisClient } from "./getRedisClient.mjs";
import { sendNotification } from "./sendNotification.mjs";

const keywords = "ryzen";

const PROCESSED_IDS_SET = "processed-ids";

{
  const redisClient = await getRedisClient();
  const results = await searchLatestResults({ keywords });

  /**
   * Start by setting a baseline so that we don't get emailed about all of the
   * _existing_ results.
   */
  for (const result of results) {
    if (result.id) {
      await redisClient.sAdd(PROCESSED_IDS_SET, result.id);
    }
  }

  await redisClient.quit();
}

const crawlerQueue = new Queue("crawler", `redis://${env.REDIS_HOST}:6379`);
await crawlerQueue.obliterate(); // In case there were old jobs scheduled from the last run. Unsure if this is necessary or not.

crawlerQueue.on("completed", () => {
  console.log("Completed crawl", new Date().toLocaleString());
});

crawlerQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed at ${new Date().toLocaleString()}`);
  console.error("Error:", err);
});

crawlerQueue.process(async function () {
  const client = await getRedisClient();
  const results = await searchLatestResults({ keywords });

  for (const result of results) {
    if (result.id) {
      const alreadyProcessed = await client.sIsMember(
        PROCESSED_IDS_SET,
        result.id,
      );

      if (!alreadyProcessed) {
        console.log("New listing found:");
        console.log({ result });

        const url = new URL(
          result.href ?? "/",
          "https://www.kleinanzeigen.de/",
        );

        sendNotification({
          subject: `New search result for ${JSON.stringify(keywords)} – ${JSON.stringify(result.heading)}`,
          html: [
            `<p>New search result found:</p>`,
            `<p><strong><em>${result.heading}</strong></em></p>`,
            `<p>${result.description}</p>`,
            `<p>${result.price}</p>`,
            `<p>Click <a href="${url.toString()}">here</a> to see the listing.</p>`,
          ].join("\n"),
        });
      }

      await client.sAdd(PROCESSED_IDS_SET, result.id);
    }
  }

  await client.quit();

  /**
   * Needs to return *something* for Bull to consider this job successful.
   */
  return { success: true };
});

crawlerQueue.add(
  {},
  {
    attempts: 3,
    repeat: { cron: "*/5 * * * *" /* Every 5 minutes */ },
  },
);
