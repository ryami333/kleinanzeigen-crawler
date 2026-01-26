import z from "zod";
import { db } from "./db";
import { querySchema } from "./querySchema";

export const queriesCollection =
  db.collection<z.infer<typeof querySchema>>("queries");
