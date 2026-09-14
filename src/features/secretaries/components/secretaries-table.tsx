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
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useRestQuery } from "@/hooks/use-rest-query";
import { SecretaryFormDialog } from "@/features/secretaries/components/secretary-form-dialog";
import { useDeleteSecretary } from "@/features/secretaries/hooks/use-delete-secretary";
import type { DialogState } from "@/types/dialog-state";
import type { SecretaryListItem } from "@/types/secertary";
import { columns } from "../types/secretary-columns";

function SecretariesTable() {
  const {
    data,
    page,
    limit,
    total,
    isLoading,
    search,
    setSearch,
    setPage,
    sort,
    setSort,
    refetch,
  } = useRestQuery<SecretaryListItem>("/api/secretaries", {
    searchFields: ["full_name", "email", "phone_number"],
    defaultSort: "-created_at",
    perPage: 10,
  });

  const [dialogState, setDialogState] =
    useState<DialogState<SecretaryListItem>>(null);
  const [deleteTarget, setDeleteTarget] = useState<SecretaryListItem | null>(
    null,
  );
  const { deleteSecretary, isLoading: isDeleting } = useDeleteSecretary(() => {
    setDeleteTarget(null);
    refetch();
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search secretaries..."
      >
        <Button onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add Secretary
        </Button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        sort={sort}
        onSortChange={setSort}
        emptyMessage="No secretaries found."
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDialogState({ mode: "edit", data: row })}
            >
              <Pencil />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 />
              <span className="sr-only">Delete</span>
            </Button>
          </>
        )}
      />

      <DataTablePagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      {dialogState && (
        <SecretaryFormDialog
          mode={dialogState.mode}
          secretary={dialogState.mode === "edit" ? dialogState.data : undefined}
          open
          onOpenChange={(open) => !open && setDialogState(null)}
          onSuccess={refetch}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete secretary</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              {deleteTarget?.full_name ?? deleteTarget?.email} from your
              secretaries list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deleteSecretary(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { SecretariesTable };
