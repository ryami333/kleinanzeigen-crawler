import nodemailer from "nodemailer";
import { createClient } from "redis";
import { searchLatestResults } from "./searchLatestResults.mjs";
import Queue from "bull";

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

const client = createClient({
  url: "redis://localhost:6379", // 'redis' is the hostname within Docker
});

client.on("error", (err) => console.error("Redis Client Error", err));

await client.connect();

const results = await searchLatestResults({ keywords });

/**
 * Start by setting a baseline so that we don't get emailed about all of the
 * _existing_ results.
 */
for (const result of results) {
  if (result.id) {
    await client.sAdd("processed-ids", result.id);
  }
}

const crawlerQueue = new Queue("crawler", "redis://localhost:6379");
await crawlerQueue.obliterate(); // In case there were old jobs scheduled from the last run. Unsure if this is necessary or not.

crawlerQueue.add(
  {},
  {
    attempts: 3,
    repeat: { cron: "*/5 * * * *" /* Every 5 minutes */ },
  },
);

crawlerQueue.on("completed", () => {
  console.log("Completed crawl", new Date().toLocaleString());
});

crawlerQueue.process(async function () {
  const results = await searchLatestResults({ keywords });

  for (const result of results) {
    if (result.id) {
      const alreadyProcessed = await client.sIsMember(
        "processed-ids",
        result.id,
      );

      if (!alreadyProcessed) {
        console.log("New listing found:");
        console.log({ result });
      }

      await client.sAdd("processed-ids", result.id);
    }
  }

  /**
   * Needs to return *something* for Bull to consider this job successful.
   */
  return { success: true };
});

await client.quit();
