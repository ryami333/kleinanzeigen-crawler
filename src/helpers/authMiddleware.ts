import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "../../auth";
import { redirect } from "@tanstack/react-router";
import { unauthorized } from "./unauthorized";

export const authMiddleware = createMiddleware().server(
  async ({ next, serverFnMeta }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw serverFnMeta ? unauthorized() : redirect({ to: "/login" });
    }

    return await next();
  },
);
