import { Heading } from "@/components/ui/heading";
import { PERMISSIONS } from "@/config/permissions";
import { PatientsTable } from "@/features/patients/components/patients-table";
import { requirePagePermission } from "@/lib/page-access";

export default async function PatientsPage() {
  await requirePagePermission(PERMISSIONS.PATIENTS_VIEW);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Heading level={1}>Patients</Heading>
      <PatientsTable />
    </div>
  );
}
