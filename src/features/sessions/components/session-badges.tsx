import { Badge } from "@/components/ui/badge";
import type { Session } from "@/types/session";

function SessionStatusBadge({ status }: { status: Session["status"] }) {
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
        Completed
      </Badge>
    );
  }

  return <Badge variant="secondary">Uncompleted</Badge>;
}

function PaymentStatusBadge({ status }: { status: Session["payment_status"] }) {
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
        Paid
      </Badge>
    );
  }

  if (status === "INPROGRESS") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
        In progress
      </Badge>
    );
  }

  return <Badge variant="secondary">Scheduled</Badge>;
}

export { SessionStatusBadge, PaymentStatusBadge };
