import { Router } from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";

const router = Router();
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded());

// parse application/json
router.use(bodyParser.json());

router.get("/", async (req, res) => {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return void res.send(`
    <html>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <body>
            <p>Please use lower-case alphanumeric queries, separated by commas, eg.</p>
            <p>“test,this-thing,another-thing”</p>
            <form method="post" action="/submit" style="display:flex; column-gap: 0.5em;">
                <input name="query" type="text" value="${currentValue}" style="flex:1 auto;" />
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>
  `);
});

router.post("/submit", async (req, res) => {
  const { data, error } = z
    .object({
      query: z
        .string()
        .trim()
        .nonempty()
        .regex(/^[a-z0-9,-]+$/), // alphanumeric and commas only
    })
    .safeParse(req.body);

  if (error) {
    console.error(error);
    return void res.sendStatus(400).send("Bad Request");
  }
  const redisClient = await getRedisClient();

  await redisClient.set(REDIS_QUERY_KEY, data.query);

  /**
   * Set a baseline so that we don't get emailed about all of the _existing_
   * results.
   */
  crawlerQueue.add(
    { sendNotifications: false },
    {
      attempts: 3,
    },
  );

  return void res.send(`
    <html>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <body>
            <p>Submitted: ${data.query}</p>
        </body>
    </html>
  `);
});

export const router;