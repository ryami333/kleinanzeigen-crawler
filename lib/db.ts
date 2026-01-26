import { MongoClient } from "mongodb";
import { env } from "./worker-env";

export const db = new MongoClient(env.MONGODB_CONNECTION_STRING).db(
  "kleinanzeigen-crawler",
);
