import { Router } from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { Layout } from "./components/Layout.mjs";

export const router = Router();
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded());

// parse application/json
router.use(bodyParser.json());

router.get("/", async (req, res) => {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return void res.send(
    renderToString(
      createElement(
        Layout,
        null,
        createElement(
          "p",
          null,
          "Please use lower-case alphanumeric queries, separated by newlines.",
        ),
        createElement(
          "form",
          {
            method: "post",
            action: "/submit",
            style: {
              display: "flex",
              flexDirection: "column",
              rowGap: "0.5em",
            },
          },
          createElement("textarea", {
            name: "query",
            type: "text",
            rows: 10,
            defaultValue: currentValue,
            style: { flex: "1 auto" },
          }),
          createElement("button", { type: "submit" }, "Submit"),
        ),
      ),
    ),
  );
});

router.post("/submit", async (req, res) => {
  const { data, error } = z
    .object({
      query: z
        .string()
        .trim()
        .nonempty()
        .regex(/^[a-z0-9\n-]+$/), // alphanumeric and newlines only
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

  return void res.send(
    renderToString(
      createElement(
        Layout,
        null,
        createElement("p", null, `Submitted: ${data.query}`),
      ),
    ),
  );
});
