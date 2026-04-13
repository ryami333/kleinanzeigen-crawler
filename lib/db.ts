import { MongoClient } from "mongodb";
import { env } from "./worker-env.ts";
import fs from "node:fs";

export const client = new MongoClient(
  fs.readFileSync(env.MONGODB_CONNECTION_STRING_FILE, "utf8").trim(),
);
export const db = client.db("kleinanzeigen-crawler");
