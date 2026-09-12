"use client";

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
import { useImageForm } from "@/hooks/use-image-form";
import type { SessionImageFormDialogProps } from "../types/session-props";

function SessionImageFormDialog({
  sessionId,
  mode,
  image,
  open,
  onOpenChange,
  onSuccess,
}: SessionImageFormDialogProps) {
  const { form, onSubmit, isLoading, error } = useImageForm({
    basePath: `/api/sessions/${sessionId}/images`,
    mode,
    image,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    },
  });
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add Image" : "Edit Image"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              required={mode === "create"}
              aria-invalid={!!errors.title}
              {...register("title", { required: mode === "create" })}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field data-invalid={!!errors.file}>
            <FieldLabel htmlFor="file">
              {mode === "create" ? "Image file" : "Replace image (optional)"}
            </FieldLabel>
            <Input
              id="file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff"
              required={mode === "create"}
              aria-invalid={!!errors.file}
              {...register("file", { required: mode === "create" })}
            />
            <FieldError errors={[errors.file]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner />}
            {mode === "create" ? "Add image" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { SessionImageFormDialog };
