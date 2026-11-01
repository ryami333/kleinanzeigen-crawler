import z from "zod";

const URL_ERROR = "Please enter a valid https://www.kleinanzeigen.de/ URL";

export const kleinanzeigenUrlSchema = z
  .url({
    protocol: /^https?$/,
    hostname: /^www\.kleinanzeigen\.de$/,
    error: URL_ERROR,
  })
  /**
   * Zod still runs refinements after the URL check fails, so only inspect the
   * port when the value actually parses (the URL check reports the error
   * otherwise).
   */
  .refine((value) => !URL.canParse(value) || new URL(value).port === "", {
    error: URL_ERROR,
  });
