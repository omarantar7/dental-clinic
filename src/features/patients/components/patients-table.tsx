"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import { useDeletePatient } from "@/features/patients/hooks/use-delete-patient";
import type { PatientListItem } from "@/types/patient";
import { columns } from "../types/patient-columns";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; patientId: string }
  | null;

function PatientsTable() {
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
  } = useRestQuery<PatientListItem>("/api/patients", {
    searchFields: ["full_name", "phone_number"],
    defaultSort: "-created_at",
    perPage: 10,
  });

  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<PatientListItem | null>(
    null,
  );
  const { deletePatient, isLoading: isDeleting } = useDeletePatient(() => {
    setDeleteTarget(null);
    refetch();
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patients..."
      >
        <Button onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add Patient
        </Button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        sort={sort}
        onSortChange={setSort}
        emptyMessage="No patients found."
        actions={(row) => (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={<Link href={`/patients/${row.id}`} />}
            >
              <Eye />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setDialogState({ mode: "edit", patientId: row.id })
              }
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
        <PatientFormDialog
          mode={dialogState.mode}
          patientId={
            dialogState.mode === "edit" ? dialogState.patientId : undefined
          }
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
            <AlertDialogTitle>Delete patient</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.full_name} from your
              patient list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deletePatient(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { PatientsTable };
