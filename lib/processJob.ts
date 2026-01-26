import { type Job } from "bull";
import { PROCESSED_IDS_SET } from "./constants.ts";
import { getRedisClient } from "./getRedisClient.ts";
import { notificationQueue } from "./notificationQueue.ts";
import { searchLatestResults } from "./searchLatestResults.ts";
import { env } from "./worker-env.ts";
import { QueryDocument } from "../src/helpers/querySchema.ts";
import { db } from "./db.ts";

export const processJob = async function (
  job: Job<{ sendNotifications: boolean }>,
) {
  const client = await getRedisClient();

  const queries = await db
    .collection<QueryDocument>("queries")
    .find()
    .toArray();

  for (const query of queries) {
    const results = await searchLatestResults({ query: query.value });

    for (const result of results) {
      if (result.id) {
        const alreadyProcessed = await client.sIsMember(
          PROCESSED_IDS_SET,
          result.id,
        );

        if (!alreadyProcessed) {
          const url = new URL(
            result.href ?? "/",
            "https://www.kleinanzeigen.de/",
          );

          if (job.data.sendNotifications) {
            notificationQueue.add({
              to: query.email || env.NODEMAILER_TO_ADDRESS,
              subject: `New search result for ${JSON.stringify(query.value)} – ${JSON.stringify(result.heading)}`,
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
};
