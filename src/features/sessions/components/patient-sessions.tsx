"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useRestQuery } from "@/hooks/use-rest-query";
import { SessionFormDialog } from "@/features/sessions/components/session-form-dialog";
import { useDeleteSession } from "@/features/sessions/hooks/use-delete-session";
import { columns } from "@/features/sessions/types/session-columns";
import type { DialogState } from "@/types/dialog-state";
import type { Session } from "@/types/session";

function PatientSessions({ patientId }: { patientId: string }) {
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
  } = useRestQuery<Session>(`/api/patients/${patientId}/sessions`, {
    searchFields: ["session_name", "diagnosis", "tooth_numbers"],
    defaultSort: "-session_start_date",
    perPage: 5,
  });

  const [dialogState, setDialogState] = useState<DialogState<string>>(null);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const { deleteSession, isLoading: isDeleting } = useDeleteSession(() => {
    setDeleteTarget(null);
    refetch();
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Sessions</CardTitle>
        <Button size="sm" onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add Session
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DataTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search sessions..."
        />

        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          emptyMessage="No sessions yet."
          actions={(row) => (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <Link href={`/patients/${patientId}/sessions/${row.id}`} />
                }
              >
                <Eye />
                <span className="sr-only">View</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  setDialogState({ mode: "edit", data: row.id })
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
      </CardContent>

      {dialogState && (
        <SessionFormDialog
          mode={dialogState.mode}
          patientId={patientId}
          sessionId={
            dialogState.mode === "edit" ? dialogState.data : undefined
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
            <AlertDialogTitle>Delete session</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.session_name}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deleteSession(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export { PatientSessions };
