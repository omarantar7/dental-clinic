import { ProfileForm } from "@/features/profile/components/profile-form";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function ProfilePage() {
  const payload = await getCurrentUser();

  return <ProfileForm user={payload} />;
}
