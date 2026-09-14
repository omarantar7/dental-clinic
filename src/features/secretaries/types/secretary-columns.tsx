import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/components/data-table/types";
import type { SecretaryListItem } from "@/types/secertary";
import { formatDate } from "@/utils/format";

function SecretaryStatusBadge({
  status,
}: {
  status: SecretaryListItem["status"];
}) {
  if (status === "ENABLED") {
    return (
      <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
        Enabled
      </Badge>
    );
  }

  if (status === "DISABLED") {
    return <Badge variant="secondary">Disabled</Badge>;
  }

  return <Badge variant="destructive">Deleted</Badge>;
}

const columns: DataTableColumn<SecretaryListItem>[] = [
  {
    key: "full_name",
    header: "Name",
    sortField: "full_name",
    isPrimary: true,
    cell: (row) => row.full_name ?? "—",
  },
  {
    key: "email",
    header: "Email",
    sortField: "email",
    cell: (row) => (
      <a href={`mailto:${row.email}`} className="hover:underline">
        {row.email}
      </a>
    ),
  },
  {
    key: "phone_number",
    header: "Phone",
    sortField: "phone_number",
    cell: (row) => (
      <a href={`tel:${row.phone_number}`} className="hover:underline">
        {row.phone_number}
      </a>
    ),
  },
  {
    key: "role_name",
    header: "Role",
    cell: (row) => row.role_name ?? "—",
  },
  // {
  //   key: "status",
  //   header: "Status",
  //   cell: (row) => <SecretaryStatusBadge status={row.status} />,
  // },
  {
    key: "hired_at",
    header: "Hired",
    sortField: "hired_at",
    cell: (row) => (row.hired_at ? formatDate(row.hired_at) : "—"),
  },
];

export { columns };
