import { PERMISSIONS } from "@/config/permissions";
import { PatientDetailView } from "@/features/patients/components/patient-detail-view";
import { requirePagePermission } from "@/lib/page-access";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission(PERMISSIONS.PATIENTS_VIEW);
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col p-6">
      <PatientDetailView patientId={id} />
    </div>
  );
}
