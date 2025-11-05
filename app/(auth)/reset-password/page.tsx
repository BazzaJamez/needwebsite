import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-h1">Reset Password</h1>
      <p className="text-muted">Password reset form coming soon...</p>
    </div>
  );
}

