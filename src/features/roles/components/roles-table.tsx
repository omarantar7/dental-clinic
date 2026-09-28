"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { FieldError } from "@/components/ui/field";
import { RoleFormDialog } from "@/features/roles/components/role-form-dialog";
import { useDeleteRole } from "@/features/roles/hooks/use-delete-role";
import { useRoles } from "@/features/roles/hooks/use-roles";
import type { DialogState } from "@/types/dialog-state";
import type { RoleListItem } from "@/types/role";
import { columns } from "../types/role-columns";

function RolesTable() {
  const { roles, isLoading, refetch } = useRoles();
  const [dialogState, setDialogState] =
    useState<DialogState<RoleListItem>>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null);
  const {
    deleteRole,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteRole(() => {
    setDeleteTarget(null);
    refetch();
  });

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    resetDelete();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        emptyMessage="No roles yet. Add one to give secretaries access."
        actions={[
          {
            label: "Edit",
            icon: Pencil,
            onClick: (row) => setDialogState({ mode: "edit", data: row }),
          },
          {
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteTarget(row),
          },
        ]}
      />

      {dialogState && (
        <RoleFormDialog
          mode={dialogState.mode}
          role={dialogState.mode === "edit" ? dialogState.data : undefined}
          open
          onOpenChange={(open) => !open && setDialogState(null)}
          onSuccess={refetch}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteTarget?.name} role. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* Most likely a 409: the role is still assigned to secretaries. */}
          {deleteError && <FieldError>{deleteError.message}</FieldError>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deleteRole(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { RolesTable };
