import z from "zod";

export const formValidationSchema = z.object({
  query: z
    .object({
      id: z.string(),
      value: z.union([
        z
          .url({
            protocol: /^https?$/,
            hostname: /^www\.kleinanzeigen\.de/,
            error: "Please enter a valid https://www.kleinanzeigen.de/ URL",
          })
          .trim(),
        z
          .string() /**
           * \u00e4 -> ä
           * \u00f6 -> ö
           * \u00fc -> ü
           * \u00df -> ß
           */
          .regex(/^[a-z0-9\u00e4\u00f6\u00fc\u00df\r\n-]+$/) // alphanumeric. newlines, ü, ä and ö only
          .trim()
          .nonempty({ error: "Row cannot be empty" }),
      ]),
    })
    .array(),
});
