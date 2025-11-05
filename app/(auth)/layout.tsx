// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-elev px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

