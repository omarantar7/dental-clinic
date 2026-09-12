import { PatientDetailView } from "@/features/patients/components/patient-detail-view";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col p-6">
      <PatientDetailView patientId={id} />
    </div>
  );
}
