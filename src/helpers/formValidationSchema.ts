import z from "zod";
import { querySchema } from "./querySchema.ts";

export const formValidationSchema = z.object({
  queries: querySchema.array(),
});
