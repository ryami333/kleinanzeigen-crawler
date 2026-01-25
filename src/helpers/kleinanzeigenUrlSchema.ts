import z from "zod";

export const kleinanzeigenUrlSchema = z.url({
  protocol: /^https?$/,
  hostname: /^www\.kleinanzeigen\.de/,
  error: "Please enter a valid https://www.kleinanzeigen.de/ URL",
});
