"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { isPermissionCode } from "@/config/permissions";
import { useApi } from "@/hooks/use-api";
import { RoleCreateSchema, type RoleListItem } from "@/types/role";

interface UseRoleFormOptions {
  mode: "create" | "edit";
  role?: RoleListItem;
  onSuccess: () => void;
}

function useRoleForm({ mode, role, onSuccess }: UseRoleFormOptions) {
  const { request, isLoading: isSubmitting, error } = useApi<RoleListItem>();

  // The dialog mounts per open, so defaultValues are enough; no reset effect.
  const form = useForm({
    resolver: zodResolver(RoleCreateSchema),
    defaultValues: {
      name: role?.name ?? "",
      permission_codes: role?.permission_codes.filter(isPermissionCode) ?? [],
    },
  });

  // Edit sends both fields, so the create schema validates both modes.
  const onSubmit = form.handleSubmit(async (data) => {
    const result =
      mode === "create"
        ? await request("POST", "/api/roles", data)
        : await request("PATCH", `/api/roles/${role?.id}`, data);
    if (!result) return;

    toast.success(mode === "create" ? "Role created" : "Role updated");
    onSuccess();
  });

  return { form, onSubmit, isSubmitting, error };
}

export { useRoleForm };
