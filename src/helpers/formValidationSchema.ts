import z from "zod";
import { querySchema } from "./querySchema";

export const formValidationSchema = z.object({
  queries: querySchema.array(),
});
