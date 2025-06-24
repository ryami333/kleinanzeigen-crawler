import NextAuth from "next-auth";
import fs from "node:fs";
import { env } from "./lib/env.mjs";
import { OIDCConfig } from "next-auth/providers";

export const { auth, handlers, signIn, signOut } = NextAuth(
  // Using callback-style so that secret is not evaluated during build-time
  () => ({
    secret: fs.readFileSync(env.AUTH_SECRET_FILE, "utf-8"),
    trustHost: true, // Needed in Docker context
    providers: [
      {
        id: "pocket", // Internal id used by signIn("pocket")
        name: "Pocket ID",
        type: "oidc",
        issuer: env.OAUTH_ISSUER,
        clientId: env.OAUTH_CLIENT_ID,
        clientSecret: fs
          .readFileSync(env.OAUTH_CLIENT_SECRET_FILE, "utf-8")
          .trim(), // get rid of newlines,

        /* Pocket-ID returns sub/email/name/picture by default */
        authorization: { params: { scope: "openid email profile" } },

        /* Optional profile mapper */
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name ?? profile.preferred_username,
            email: profile.email,
            image: profile.picture,
          };
        },

        /* Extra safety – Pocket-ID uses code-flow + PKCE */
        checks: ["pkce", "nonce", "state"],
      } satisfies OIDCConfig<Record<string, any>>,
    ],
  }),
);
