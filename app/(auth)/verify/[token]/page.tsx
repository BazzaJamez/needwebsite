import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function VerifyPage({ params }: Props) {
  const { token } = await params;
  
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-h1">Verify Email</h1>
      <p className="text-muted">Email verification for token: {token}</p>
    </div>
  );
}

