import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { queriesCollection } from "./queriesCollection.ts";
import { serializeMany } from "./serializeDocument.ts";

export const getCurrentQueryValue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const queries = await queriesCollection.find().toArray();

    return serializeMany(queries);
  });
