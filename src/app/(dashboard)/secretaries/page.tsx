import { Heading } from "@/components/ui/heading";
import { SecretariesTable } from "@/features/secretaries/components/secretaries-table";
import { requireDoctorPage } from "@/lib/page-access";

export default async function SecretariesPage() {
  await requireDoctorPage();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Heading level={1}>Secretaries</Heading>
      <SecretariesTable />
    </div>
  );
}
