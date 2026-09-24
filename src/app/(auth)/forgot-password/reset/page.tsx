import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

type ForgotPasswordResetPageProps = {
  searchParams: Promise<{ reset_id?: string }>;
};

export default async function ForgotPasswordResetPage({
  searchParams,
}: ForgotPasswordResetPageProps) {
  const { reset_id } = await searchParams;

  return <ResetPasswordForm resetId={reset_id ?? ""} />;
}
