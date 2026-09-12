import type { DataTableColumn } from "@/components/data-table/types";
import {
  PaymentStatusBadge,
  SessionStatusBadge,
} from "@/features/sessions/components/session-badges";
import type { Session } from "@/types/session";
import { formatCurrency, formatDateTime } from "@/utils/format";

const columns: DataTableColumn<Session>[] = [
  {
    key: "session_name",
    header: "Session",
    isPrimary: true,
    cell: (row) => row.session_name,
  },
  {
    key: "session_start_date",
    header: "Start",
    sortField: "session_start_date",
    cell: (row) =>
      row.session_start_date ? formatDateTime(row.session_start_date) : "—",
  },
  {
    key: "total_amount",
    header: "Amount",
    sortField: "total_amount",
    cell: (row) => formatCurrency(row.total_amount),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <SessionStatusBadge status={row.status} />,
  },
  {
    key: "payment_status",
    header: "Payment",
    cell: (row) => <PaymentStatusBadge status={row.payment_status} />,
  },
];

export { columns };
