import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-16 bg-surface shadow-1 transition-shadow">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-bg">
          Marketplace
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-sm text-muted transition-colors hover:text-bg"
          >
            Browse
          </Link>
          <Link
            href="/signin"
            className="text-sm text-muted transition-colors hover:text-bg"
          >
            Sign in
          </Link>
          <Button variant="primary" size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

