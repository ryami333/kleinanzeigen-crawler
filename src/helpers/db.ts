import { MongoClient } from "mongodb";
import { env } from "./frontend-env";
import fs from "node:fs";

export const db = new MongoClient(
  fs.readFileSync(env.MONGODB_CONNECTION_STRING_FILE, "utf8").trim(),
).db("kleinanzeigen-crawler");
