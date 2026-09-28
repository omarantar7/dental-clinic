import type { DataTableColumn } from "@/components/data-table/types";
import { ALL_PERMISSION_CODES } from "@/config/permissions";
import type { RoleListItem } from "@/types/role";

const columns: DataTableColumn<RoleListItem>[] = [
  {
    key: "name",
    header: "Name",
    isPrimary: true,
    cell: (row) => row.name,
  },
  {
    key: "permissions",
    header: "Permissions",
    cell: (row) =>
      `${row.permission_codes.length} of ${ALL_PERMISSION_CODES.length}`,
  },
  {
    key: "secretary_count",
    header: "Secretaries",
    cell: (row) => row.secretary_count,
  },
];

export { columns };
