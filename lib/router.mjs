import { Router } from "express";
import bodyParser from "body-parser";
import { z } from "zod";
import { getRedisClient } from "./getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "./constants.mjs";
import { crawlerQueue } from "./crawlerQueue.mjs";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
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

router.post("/submit", async (req, res) => {});
