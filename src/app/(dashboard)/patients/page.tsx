import { Heading } from "@/components/ui/heading";
import { PatientsTable } from "@/features/patients/components/patients-table";

export default function PatientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Heading level={1}>Patients</Heading>
      <PatientsTable />
    </div>
  );
}
