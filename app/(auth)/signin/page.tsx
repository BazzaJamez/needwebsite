"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("next") || searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
    }
  }, [session, status, router, searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for the magic link!",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-h1">Sign In</h1>

      {/* Email Sign In */}
      <form onSubmit={handleEmailSignIn} className="mb-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-base outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send magic link"}
        </Button>

        {message && (
          <div
            className={`rounded-xl px-4 py-2 text-sm ${
              message.type === "success"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-2 text-muted">Or continue with</span>
        </div>
      </div>

      {/* GitHub Sign In */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleGitHubSignIn}
        disabled={isLoading}
      >
        Sign in with GitHub
      </Button>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
