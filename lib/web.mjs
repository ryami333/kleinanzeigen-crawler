import "dotenv/config"; // Only needed for local development
import express from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

const REDIS_QUERY_KEY = "queries-27838f18-0904-402b-bb8d-96298b366098";

app.get("/", async (req, res) => {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return void res.send(`
    <html>
        <body>
            <form method="post" action="/submit">
                <input name="query" type="text" value="${currentValue}" />
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>
  `);
});

app.post("/submit", async (req, res) => {
  const { data, error } = z
    .object({ query: z.string().trim() })
    .safeParse(req.body);

  if (error) {
    console.error(error);
    return void res.sendStatus(400).send("Bad Request");
  }
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.set(REDIS_QUERY_KEY, data.query);

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
