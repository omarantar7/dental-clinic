import { SessionDetailView } from "@/features/sessions/components/session-detail-view";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;

  return (
    <div className="flex flex-1 flex-col p-6">
      <SessionDetailView patientId={id} sessionId={sessionId} />
    </div>
  );
}
