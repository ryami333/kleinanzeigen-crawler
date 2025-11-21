import { type Job } from "bull";
import { PROCESSED_IDS_SET, REDIS_QUERY_KEY } from "./constants.mts";
import { getRedisClient } from "./getRedisClient.mts";
import { notificationQueue } from "./notificationQueue.mts";
import { searchLatestResults } from "./searchLatestResults.mts";

export const processJob = async function (
  job: Job<{ sendNotifications: boolean }>,
) {
  const client = await getRedisClient();

  const queries = (await client.get(REDIS_QUERY_KEY))?.trim().split("\n") ?? [];

  for (const query of queries) {
    const results = await searchLatestResults({ query });

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
};
