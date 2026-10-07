"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";
import type { SessionProgress } from "@/features/calendar/types/calendar-props";
import type { SessionDetail } from "@/types/session";

function useSessionProgress(onSuccess: () => void) {
  const { request, isLoading } = useApi<SessionDetail>();

  const updateProgress = async (
    sessionId: string,
    status: SessionProgress,
  ): Promise<boolean> => {
    const result = await request("PATCH", `/api/sessions/${sessionId}`, {
      status,
    });

    if (!result) {
      toast.error("Could not update the session status");
      return false;
    }

    toast.success(
      status === "COMPLETED"
        ? "Session marked as completed"
        : "Session marked as uncompleted",
    );
    onSuccess();
    return true;
  };

  return { updateProgress, isUpdating: isLoading };
}

export { useSessionProgress };
