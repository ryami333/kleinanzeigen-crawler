import { MongoClient } from "mongodb";

export const db = new MongoClient("connection string" /* TODO */).db(
  "dbname" /* TODO */,
);
