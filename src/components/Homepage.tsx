"use client";

import { useTransition } from "react";
import { submitQueryAction } from "../helpers/submitQueryAction";

export const Homepage = ({ currentValue }: { currentValue: string }) => {
  const [isSubmitting, startTransition] = useTransition();

  const onSubmit: React.FormEventHandler = (e) =>
    startTransition(async () => {
      e.preventDefault();

      const query = e.currentTarget.querySelector("textarea")?.value ?? "";

      await submitQueryAction({ query });
    });

  return (
    <>
      <p>Please use lower-case alphanumeric queries, separated by newlines.</p>
      <form
        method="post"
        action="/submit"
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "0.5em",
        }}
      >
        <textarea
          name="query"
          rows={10}
          defaultValue={currentValue ?? undefined}
          style={{ flex: "1 auto" }}
        />
        <button type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </form>
    </>
  );
};
