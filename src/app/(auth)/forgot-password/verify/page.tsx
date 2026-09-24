import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

type ForgotPasswordVerifyPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ForgotPasswordVerifyPage({
  searchParams,
}: ForgotPasswordVerifyPageProps) {
  const { email } = await searchParams;

  return <VerifyOtpForm email={email ?? ""} />;
}
