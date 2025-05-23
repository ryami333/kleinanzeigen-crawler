import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import fs from "node:fs";
import path from "node:path";
import { env } from "./lib/env.mjs";

const AUTH_SECRET = fs.readFileSync(
  path.resolve(process.cwd(), env.AUTH_SECRET_FILE),
  "utf8",
);

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      issuer: "https://auth.mitch-ryan.com/realms/master",
      // baseURL: "https://kc.mitch-ryan.com",
      clientId: "mitchs-kleinanzeigen-crawler",
      clientSecret: AUTH_SECRET,
      // idpLogout: true,
    }),
  ],
});
