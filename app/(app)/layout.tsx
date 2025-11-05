import { Navbar } from "@/components/shared/Navbar";

// Force dynamic rendering for app pages
export const dynamic = 'force-dynamic';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

