"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { InfoRow } from "@/components/ui/info-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import {
  PaymentStatusBadge,
  SessionStatusBadge,
} from "@/features/sessions/components/session-badges";
import { SessionFormDialog } from "@/features/sessions/components/session-form-dialog";
import { SessionImages } from "@/features/sessions/components/session-images";
import { SessionPayments } from "@/features/sessions/components/session-payments";
import { useSessionDetail } from "@/features/sessions/hooks/use-session-detail";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import type { SessionDetailViewProps } from "../types/session-props";

function SessionDetailView({ patientId, sessionId }: SessionDetailViewProps) {
  const { session, isLoading, error, refetch } = useSessionDetail(sessionId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading && !session) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !session) {
    return <Text>Failed to load session.</Text>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/patients/${patientId}`} />}
        >
          <ArrowLeft />
          Back to patient
        </Button>
        <Button size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil />
          Edit
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Heading level={1}>{session.session_name}</Heading>
        <SessionStatusBadge status={session.status} />
        <PaymentStatusBadge status={session.payment_status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Start"
              value={
                session.session_start_date
                  ? formatDateTime(session.session_start_date)
                  : null
              }
            />
            <InfoRow
              label="End"
              value={
                session.session_end_date
                  ? formatDateTime(session.session_end_date)
                  : null
              }
            />
            <InfoRow label="Diagnosis" value={session.diagnosis} />
            <InfoRow label="Tooth numbers" value={session.tooth_numbers} />
            <InfoRow label="Description" value={session.description} />
            <InfoRow label="Extra notes" value={session.extra_notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow
              label="Total amount"
              value={formatCurrency(session.total_amount)}
            />
            <InfoRow
              label="Amount paid"
              value={formatCurrency(session.amount_paid)}
            />
            <InfoRow
              label="Balance due"
              value={formatCurrency(session.amount_owed)}
            />
          </CardContent>
        </Card>
      </div>

      <SessionPayments
        sessionId={session.id}
        payments={session.payments}
        remainingBalance={session.amount_owed}
        onSuccess={refetch}
      />

      <SessionImages sessionId={session.id} />

      {session.previous_sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {session.previous_sessions.map((previousSession) => (
              <Link
                key={previousSession.id}
                href={`/patients/${patientId}/sessions/${previousSession.id}`}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
              >
                <span className="text-sm">{previousSession.session_name}</span>
                <Text className="text-xs">
                  {previousSession.session_start_date
                    ? formatDate(previousSession.session_start_date)
                    : "—"}
                </Text>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {isEditOpen && (
        <SessionFormDialog
          mode="edit"
          patientId={patientId}
          sessionId={session.id}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

export { SessionDetailView };
