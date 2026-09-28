import { Heading } from "@/components/ui/heading";
import { RolesTable } from "@/features/roles/components/roles-table";
import { requireDoctorPage } from "@/lib/page-access";

export default async function RolesPage() {
  await requireDoctorPage();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Heading level={1}>Roles</Heading>
      <RolesTable />
    </div>
  );
}
