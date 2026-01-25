import { createAuthClient } from "better-auth/react";
import { env } from "./frontend-env.ts";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined" ? env.BASE_URL : window.location.origin,
});
