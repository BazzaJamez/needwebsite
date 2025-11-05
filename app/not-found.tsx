import Link from "next/link";
import { Suspense } from "react";
import { HeroSearch } from "@/components/shared/HeroSearch";
import { Button } from "@/components/ui/button";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-h1">404 - Page Not Found</h1>
        <p className="mb-8 text-lg text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mb-8">
          <Suspense fallback={<div>Loading search...</div>}>
            <HeroSearch />
          </Suspense>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="primary" asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/categories">Browse categories</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

