"use client";

import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Spinner } from "@/components/ui/spinner";
import { PermissionChecklist } from "@/features/roles/components/permission-checklist";
import { useRoleForm } from "@/features/roles/hooks/use-role-form";
import type { RoleFormDialogProps } from "../types/role-props";

function RoleFormDialog({
  mode,
  role,
  open,
  onOpenChange,
  onSuccess,
}: RoleFormDialogProps) {
  const { form, onSubmit, isSubmitting, error } = useRoleForm({
    mode,
    role,
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

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add Role" : "Edit Role"}
      description="Choose what secretaries with this role can do."
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Controller
            control={control}
            name="permission_codes"
            render={({ field }) => (
              <PermissionChecklist
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add role" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { RoleFormDialog };
