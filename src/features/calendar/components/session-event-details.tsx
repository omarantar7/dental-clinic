"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ExternalLink, Pencil, Trash2 } from "lucide-react";

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
import { ResponsivePopover } from "@/components/ui/responsive-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERMISSIONS } from "@/config/permissions";
import { useAccess } from "@/hooks/use-access";
import {
  PaymentStatusBadge,
  SessionStatusBadge,
} from "@/features/sessions/components/session-badges";
import { useDeleteSession } from "@/features/sessions/hooks/use-delete-session";
import { formatDateTimeRange } from "@/utils/format";
import { useSessionProgress } from "../hooks/use-session-progress";
import type {
  SessionEventDetailsProps,
  SessionProgress,
} from "../types/calendar-props";

const PROGRESS_OPTIONS: { value: SessionProgress; label: string }[] = [
  { value: "UNCOMPLETED", label: "Uncompleted" },
  { value: "COMPLETED", label: "Completed" },
];

function SessionEventDetails({
  selection,
  onClose,
  onEdit,
  onChanged,
}: SessionEventDetailsProps) {
  const { event, anchor } = selection;
  const { can } = useAccess();
  // Local copy so the badge and dropdown update without waiting for the
  // calendar refetch, which doesn't reach this already-selected event.
  const [status, setStatus] = useState(event.status);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { updateProgress, isUpdating } = useSessionProgress(onChanged);
  const { deleteSession, isLoading: isDeleting } = useDeleteSession(() => {
    setIsConfirmingDelete(false);
    onClose();
    onChanged();
  });

  const handleProgressChange = async (next: SessionProgress | null) => {
    if (!next || next === status) return;
    const previous = status;
    setStatus(next);
    const isSaved = await updateProgress(event.id, next);
    if (!isSaved) setStatus(previous);
  };

  return (
    <>
      <ResponsivePopover
        open={!isConfirmingDelete}
        onOpenChange={(open) => !open && onClose()}
        anchor={anchor}
        title={event.patient_name}
        description={event.session_name}
      >
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5" />
            {formatDateTimeRange(event.start, event.end)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <SessionStatusBadge status={status} />
            {can(PERMISSIONS.PAYMENTS_VIEW) && (
              <PaymentStatusBadge status={event.payment_status} />
            )}
          </div>
        </div>

        {can(PERMISSIONS.SESSIONS_UPDATE) && (
          <Select
            items={PROGRESS_OPTIONS}
            value={status === "DELETED" ? null : status}
            onValueChange={handleProgressChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full" aria-label="Session status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRESS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/patients/${event.patient_id}/sessions/${event.id}`} />
            }
          >
            <ExternalLink />
            Open details
          </Button>
          {can(PERMISSIONS.SESSIONS_UPDATE) && (
            <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
              <Pencil />
              Edit
            </Button>
          )}
          {can(PERMISSIONS.SESSIONS_DELETE) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </ResponsivePopover>

      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={(open) => !open && setIsConfirmingDelete(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{event.session_name}&quot; for{" "}
              {event.patient_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteSession(event.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { SessionEventDetails };
