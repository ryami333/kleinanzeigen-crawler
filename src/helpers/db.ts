import { MongoClient } from "mongodb";
import { env } from "./frontend-env";

export const db = new MongoClient(
  env.MONGODB_CONNECTION_STRING,
).db(/* Use DB name from connection string */);
