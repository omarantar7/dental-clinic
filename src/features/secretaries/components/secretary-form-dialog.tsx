"use client";

import { useMemo } from "react";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRoles } from "@/features/roles/hooks/use-roles";
import { useSecretaryForm } from "@/features/secretaries/hooks/use-secretary-form";
import type { SecretaryFormDialogProps } from "../types/secretary-props";

function SecretaryFormDialog({
  mode,
  secretary,
  open,
  onOpenChange,
  onSuccess,
}: SecretaryFormDialogProps) {
  const { form, onSubmit, isSubmitting, error } = useSecretaryForm({
    mode,
    secretary,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    },
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const { roles, isLoading: isLoadingRoles } = useRoles();
  // Passing items lets SelectValue show the role name instead of its id.
  const roleItems = useMemo(
    () => [
      { label: "No role", value: null },
      ...roles.map((role) => ({ label: role.name, value: role.id })),
    ],
    [roles],
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add Secretary" : "Edit Secretary"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {mode === "create" && (
            <>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  Temporary password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
            </>
          )}

          <Field data-invalid={!!errors.full_name}>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
            <FieldError errors={[errors.full_name]} />
          </Field>

          <Field data-invalid={!!errors.phone_number}>
            <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
            <Input
              id="phone_number"
              type="tel"
              aria-invalid={!!errors.phone_number}
              {...register("phone_number")}
            />
            <FieldError errors={[errors.phone_number]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="role_id">Role</FieldLabel>
            <Controller
              control={control}
              name="role_id"
              render={({ field }) => (
                <Select
                  items={roleItems}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingRoles}
                >
                  <SelectTrigger id="role_id" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleItems.map((item) => (
                      <SelectItem key={item.value ?? "none"} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription>
              Without a role, the secretary can sign in but can&apos;t access
              anything.
            </FieldDescription>
          </Field>

          {mode === "edit" && (
            <Field orientation="horizontal">
              <Controller
                control={control}
                name="enabled"
                render={({ field }) => (
                  <Switch
                    id="enabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldContent>
                <FieldLabel htmlFor="enabled">Account enabled</FieldLabel>
                <FieldDescription>
                  A disabled secretary loses access on their next request.
                </FieldDescription>
              </FieldContent>
            </Field>
          )}

          {mode === "create" && (
            <>
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea
                  id="address"
                  aria-invalid={!!errors.address}
                  {...register("address")}
                />
                <FieldError errors={[errors.address]} />
              </Field>

              <Field data-invalid={!!errors.hired_at}>
                <FieldLabel htmlFor="hired_at">Hired at</FieldLabel>
                <Input
                  id="hired_at"
                  type="date"
                  aria-invalid={!!errors.hired_at}
                  {...register("hired_at")}
                />
                <FieldError errors={[errors.hired_at]} />
              </Field>
            </>
          )}

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add secretary" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { SecretaryFormDialog };
