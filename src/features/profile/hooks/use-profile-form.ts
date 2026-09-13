import type { Role } from "@/config/roles";
import { useApi } from "@/hooks/use-api";

function useProfileForm(userRole: Role) {
  const { request: SubmitRequest, isLoading: isSubmitting, error } = useApi();
}
