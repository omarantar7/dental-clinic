import type { DataTableColumn } from "@/components/data-table/types";
import type { PatientListItem } from "@/types/patient";
import { formatCurrency, formatDate } from "@/utils/format";

const columns: DataTableColumn<PatientListItem>[] = [
  {
    key: "full_name",
    header: "Name",
    sortField: "full_name",
    isPrimary: true,
    cell: (row) => row.full_name,
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
    key: "total_balance",
    header: "Total balance",
    cell: (row) => formatCurrency(row.total_balance),
  },
  {
    key: "paid_balance",
    header: "Paid balance",
    cell: (row) => formatCurrency(row.paid_balance),
  },
  {
    key: "rest_balance",
    header: "Balance due",
    cell: (row) => formatCurrency(row.rest_balance),
  },
  {
    key: "created_at",
    header: "Created",
    sortField: "created_at",
    cell: (row) => formatDate(row.created_at),
  },
];

export { columns };
