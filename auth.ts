import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { genericOAuth } from "better-auth/plugins";
import fs from "node:fs";
import { env } from "./src/helpers/frontend-env.ts";

export const auth = betterAuth({
  secret: fs.readFileSync(env.AUTH_SECRET_FILE, "utf8").trim(),
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : undefined,
  baseURL: env.BASE_URL,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "pocket-id",
          clientId: env.OAUTH_CLIENT_ID,
          clientSecret: fs
            .readFileSync(env.OAUTH_CLIENT_SECRET_FILE, "utf8")
            .trim(),
          scopes: ["profile", "openid", "email"],
          discoveryUrl: `${env.OAUTH_ISSUER}/.well-known/openid-configuration`,
        },
      ],
    }),
    /**
     * ⚠️ Needs to be last plugin in the array:
     */
    tanstackStartCookies(),
  ],
});
