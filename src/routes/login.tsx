import { Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "../helpers/authClient";

export const Route = createFileRoute("/login")({
  component: function PageComponent() {
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
  },
});
