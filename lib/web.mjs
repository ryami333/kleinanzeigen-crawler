import "dotenv/config"; // Only needed for local development
import express from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";

const app = express();
const port = 5555;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return void res.send(`
    <html>
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

app.post("/submit", async (req, res) => {
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
        <body>
            <p>Submitted: ${data.query}</p>
        </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
