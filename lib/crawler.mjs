import nodemailer from "nodemailer";
import { createClient } from "redis";
import { searchLatestResults } from "./searchLatestResults.mjs";
import Queue from "bull";
import { getRedisClient } from "./getRedisClient.mjs";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// await transporter.sendMail({
//   from: process.env.NODEMAILER_FROM_ADDRESS,
//   to: process.env.NODEMAILER_TO_ADDRESS,
//   text: "Testing!",
// });

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

const crawlerQueue = new Queue("crawler", "redis://localhost:6379");
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
