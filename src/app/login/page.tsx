"use client";

import { Button } from "@mantine/core";
import { authClient } from "../../helpers/authClient";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: `100vh`,
      }}
    >
      <Button
        onClick={() => authClient.signIn.social({ provider: "pocket-id" })}
      >
        Login
      </Button>
    </div>
  );
}
