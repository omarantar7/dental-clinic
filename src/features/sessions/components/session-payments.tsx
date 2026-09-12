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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { PaymentFormDialog } from "@/features/sessions/components/payment-form-dialog";
import { useDeletePayment } from "@/features/sessions/hooks/use-delete-payment";
import type { DialogState } from "@/types/dialog-state";
import type { Payment } from "@/types/payment";
import { formatCurrency, formatDate } from "@/utils/format";
import type { SessionPaymentsProps } from "../types/sessions-payment-props";

function SessionPayments({
  sessionId,
  payments,
  remainingBalance,
  onSuccess,
}: SessionPaymentsProps) {
  const [dialogState, setDialogState] = useState<DialogState<Payment>>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const { deletePayment, isLoading: isDeleting } = useDeletePayment(() => {
    setDeleteTarget(null);
    onSuccess();
  });

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Payments</CardTitle>
        <Button
          size="sm"
          disabled={remainingBalance <= 0}
          onClick={() => setDialogState({ mode: "create" })}
        >
          <Plus />
          Add Payment
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sortedPayments.length === 0 && <Text>No payments recorded yet.</Text>}

        {sortedPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {formatCurrency(payment.amount)}
              </span>
              <Text className="text-xs">
                {payment.payment_date ? formatDate(payment.payment_date) : "—"}
              </Text>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3">
              {payment.notes && (
                <Text className="max-w-[50%] truncate text-xs">
                  {payment.notes}
                </Text>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDialogState({ mode: "edit", data: payment })}
              >
                <Pencil />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteTarget(payment)}
              >
                <Trash2 />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      {dialogState && (
        <PaymentFormDialog
          mode={dialogState.mode}
          sessionId={sessionId}
          payment={dialogState.mode === "edit" ? dialogState.data : undefined}
          open
          onOpenChange={(open) => !open && setDialogState(null)}
          onSuccess={() => {
            setDialogState(null);
            onSuccess();
          }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this payment of{" "}
              {deleteTarget ? formatCurrency(deleteTarget.amount) : ""}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deletePayment(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export { SessionPayments };
