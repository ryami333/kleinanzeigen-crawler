import { Router } from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { Layout } from "./components/Layout.mjs";
import { auth } from "express-openid-connect";
import fs from "node:fs";
import path from "node:path";
import { env } from "./env.mjs";
import { Button } from "@mantine/core";

export const router = Router();
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded());

// parse application/json
router.use(bodyParser.json());

const AUTH_SECRET = fs.readFileSync(
  path.resolve(process.cwd(), env.AUTH_SECRET_FILE),
  "utf8",
);

router.use(
  auth({
    issuerBaseURL: "https://auth.mitch-ryan.com/realms/master",
    baseURL: "https://kc.mitch-ryan.com",
    clientID: "mitchs-kleinanzeigen-crawler",
    secret: AUTH_SECRET,
    idpLogout: true,
  }),
);

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
          // createElement("button", { type: "submit" }, "Submit"),
          createElement(Button, { fullWidth: true }),
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
        /**
         * \u00e4 -> ä
         * \u00f6 -> ö
         * \u00fc -> ü
         * \u00df -> ß
         */
        .regex(/^[a-z0-9\u00e4\u00f6\u00fc\u00df\r\n-]+$/) // alphanumeric. newlines, ü, ä and ö only
        .transform((val) => val.replace(/\r\n/g, "\n")), // normalize CRLF to LF
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
