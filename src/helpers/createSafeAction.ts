import { notFound } from "next/navigation";
import { z } from "zod";

/**
 * Server Actions are just an abstraction for an automatically-generated API
 * endpoint, which means we can't *trust* that they haven't been hi-jacked by
 * some bad actor. Therefore, the parameters might also be untrustworthy, so in
 * some cases it might be prudent to parse+validate them.
 */
export const createSafeAction = <T = unknown, J = unknown>(
  schema: z.ZodSchema<T>,
  handler: (params: T) => J,
): ((params: T) => J) => {
  return (unsafeParams: unknown) => {
    const { data: params, error } = schema.safeParse(unsafeParams);

    if (error) {
      console.error(error);
      return notFound(); // "BadRequest" would be technically more correct, but NextJS doesn't provide a helper for this yet.
    }

    return handler(params);
  };
};
