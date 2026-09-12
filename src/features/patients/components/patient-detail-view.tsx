"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Pencil, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { InfoRow } from "@/components/ui/info-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import { PatientImages } from "@/features/patients/components/patient-images";
import { usePatientDetail } from "@/features/patients/hooks/use-patient-detail";
import { formatCurrency, formatDate } from "@/utils/format";

function BalanceBadge({
  totalBilled,
  totalPaid,
  totalOwed,
}: {
  totalBilled: number;
  totalPaid: number;
  totalOwed: number;
}) {
  if (totalBilled <= 0) return null;

  if (totalOwed <= 0) {
    return (
      <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
        Paid
      </Badge>
    );
  }

  if (totalPaid > 0) {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
        Balance due
      </Badge>
    );
  }

  return <Badge variant="destructive">Unpaid</Badge>;
}

function PatientDetailView({ patientId }: { patientId: string }) {
  const { patient, balance, isLoading, error, refetch } =
    usePatientDetail(patientId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading && !patient) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !patient) {
    return <Text>Failed to load patient.</Text>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/patients" />}
        >
          <ArrowLeft />
          Back to patients
        </Button>
        <Button size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil />
          Edit
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Heading level={1}>{patient.full_name}</Heading>
        {patient.alergies && (
          <Badge variant="destructive">
            <TriangleAlert />
            Allergies
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Patient information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Phone number" value={patient.phone_number} />
            <InfoRow
              label="Gender"
              value={patient.gender === "MALE" ? "Male" : "Female"}
            />
            <InfoRow
              label="Birth date"
              value={patient.birth_date ? formatDate(patient.birth_date) : null}
            />
            <InfoRow label="Address" value={patient.address} />
            <InfoRow label="Medical history" value={patient.medical_history} />
            <InfoRow label="Allergies" value={patient.alergies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Balance</CardTitle>
            {balance && (
              <BalanceBadge
                totalBilled={balance.total_billed}
                totalPaid={balance.total_paid}
                totalOwed={balance.total_owed}
              />
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow
              label="Total billed"
              value={balance ? formatCurrency(balance.total_billed) : null}
            />
            <InfoRow
              label="Total paid"
              value={balance ? formatCurrency(balance.total_paid) : null}
            />
            <InfoRow
              label="Balance due"
              value={balance ? formatCurrency(balance.total_owed) : null}
            />
          </CardContent>
        </Card>
      </div>

      <PatientImages patientId={patient.id} />

      {isEditOpen && (
        <PatientFormDialog
          mode="edit"
          patientId={patient.id}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

export { PatientDetailView };
