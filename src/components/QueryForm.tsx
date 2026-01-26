import { zodResolver } from "@hookform/resolvers/zod";
import { querySchema } from "../helpers/querySchema";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Button, Divider, Group, Stack, TextInput } from "@mantine/core";

export function QueryForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: z.infer<typeof querySchema>;
  onSubmit: (formValues: z.infer<typeof querySchema>) => void;
}) {
  const { register, handleSubmit, formState, setValue, control, getValues } =
    useForm({
      resolver: zodResolver(querySchema),
      defaultValues,
    });

  const notificationCount = useWatch({
    control,
    name: "notifications",
    compute: (value) => value?.length ?? 0,
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
        {new Array(notificationCount)
          .fill(undefined)
          .map((_, notificationIndex) => (
            <Group>
              <TextInput
                key={notificationIndex}
                label="Notification Email"
                style={{ flex: "1 auto" }}
                error={
                  formState.errors?.notifications?.[notificationIndex]?.message
                }
                description="Leave blank to use default notification email"
                {...register(`notifications.${notificationIndex}`)}
              />
              <Button
                onClick={() =>
                  setValue(
                    `notifications`,
                    getValues("notifications")?.filter(
                      (__, i) => i !== notificationIndex,
                    ),
                  )
                }
              >
                Remove Email
              </Button>
            </Group>
          ))}
        <Button
          onClick={() => setValue(`notifications.${notificationCount}`, "")}
        >
          Add Email
        </Button>

        <Divider />
        <Button type="submit" variant="outline">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
