import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-elev">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-bg">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/categories" className="transition-colors hover:text-bg">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-bg">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-bg">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-bg">For Sellers</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/services/new" className="transition-colors hover:text-bg">
                  Create service
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-bg">
                  Seller fees
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-bg">Account</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/signin" className="transition-colors hover:text-bg">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-bg">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold text-bg">Legal</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/terms" className="transition-colors hover:text-bg">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-bg">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

