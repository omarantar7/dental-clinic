import type { DataTableColumn } from "@/components/data-table/types";
import { StatusDot } from "@/components/ui/status-dot";
import type { PatientListItem } from "@/types/patient";
import { formatCurrency, formatDate } from "@/utils/format";
import { getStatus } from "@/utils/payment-status";

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
    cell: (row) => {
      const status = getStatus(row.total_balance, row.paid_balance);
      return (
        <span className="inline-flex items-center gap-2">
          <StatusDot {...status} />
          {formatCurrency(row.total_balance)}
        </span>
      );
    },
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
