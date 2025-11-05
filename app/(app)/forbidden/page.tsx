import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mb-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <svg
            className="h-8 w-8 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-h1">Access Forbidden</h1>
        <p className="text-muted">
          You don&apos;t have permission to access this page. This area is reserved for sellers.
        </p>
      </div>

      <div className="space-y-3">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/search">Browse Services</Link>
        </Button>
      </div>
    </div>
  );
}

