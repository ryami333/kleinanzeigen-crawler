import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import fs from "node:fs";
import { env } from "./lib/env.mjs";

export const { auth, handlers, signIn, signOut } = NextAuth(
  // Using callback-style so that secret is not evaluated during build-time
  () => ({
    secret: fs.readFileSync(env.AUTH_SECRET_FILE, "utf-8"),
    trustHost: true, // Needed in Docker context
    providers: [
      Keycloak({
        issuer: "https://auth.mitch-ryan.com/realms/master",
        clientId: env.OAUTH_CLIENT_ID,
        clientSecret: fs
          .readFileSync(env.OAUTH_CLIENT_SECRET_FILE, "utf-8")
          .trim(), // get rid of newlines,
      }),
    ],
  }),
);
