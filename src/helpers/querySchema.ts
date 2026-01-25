import z from "zod";
import { kleinanzeigenUrlSchema } from "./kleinanzeigenUrlSchema";

const NONEMPTY_ERROR = "Row cannot be empty";

export const querySchema = z.object({
  id: z.uuid(),
  value: z.union([
    z
      .string()
      .trim()
      .nonempty({ error: NONEMPTY_ERROR })
      .pipe(kleinanzeigenUrlSchema),
    z
      .string() /**
       * \u00e4 -> ä
       * \u00f6 -> ö
       * \u00fc -> ü
       * \u00df -> ß
       */
      .trim()
      .nonempty({ error: NONEMPTY_ERROR })
      .regex(/^[a-z0-9\u00e4\u00f6\u00fc\u00df\r\n-]+$/, {
        error:
          "May contain alphanumeric characters only (including ü, ä, ö and ß) ",
      }),
  ]),
  email: z
    .string()
    .trim()
    .nullish()
    .refine(
      (input) => (input ? z.email().safeParse(input).success : true),
      "Invalid email address",
    ),
});
