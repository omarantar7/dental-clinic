import { PERMISSIONS } from "@/config/permissions";
import { SessionDetailView } from "@/features/sessions/components/session-detail-view";
import { requirePagePermission } from "@/lib/page-access";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  await requirePagePermission(PERMISSIONS.SESSIONS_VIEW);
  const { id, sessionId } = await params;

  return (
    <div className="flex flex-1 flex-col p-6">
      <SessionDetailView patientId={id} sessionId={sessionId} />
    </div>
  );
}
