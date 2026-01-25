import { zodResolver } from "@hookform/resolvers/zod";
import { querySchema } from "../helpers/querySchema";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button, Divider, Stack, TextInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

export function QueryForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: z.infer<typeof querySchema>;
  onSubmit: (formValues: z.infer<typeof querySchema>) => void;
}) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(querySchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "0.5em",
      }}
    >
      <Stack gap="sm">
        <TextInput
          label="Query"
          style={{ flex: "1 auto" }}
          error={formState.errors?.value?.message}
          {...register(`value`)}
        />
        <TextInput
          label="Notification Email"
          style={{ flex: "1 auto" }}
          error={formState.errors?.email?.message}
          description="Leave blank to use default notification email"
          {...register(`email`)}
        />
        <Divider />
        <Button type="submit" variant="outline">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
