"use server";

import z from "zod";
import { createSafeAction } from "./createSafeAction";
import { redirect } from "next/navigation";
import { signOut } from "../../auth";

export const signOutAction = createSafeAction(z.object({}), async () => {
  await signOut();

  return redirect("/");
});
