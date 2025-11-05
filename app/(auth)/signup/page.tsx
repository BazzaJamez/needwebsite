"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Sign up is the same as sign in - user is created on first sign in
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

  const handleGitHubSignUp = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-h1">Sign Up</h1>

      {/* Email Sign Up */}
      <form onSubmit={handleEmailSignUp} className="mb-8 space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-base outline-none focus:ring-2 focus:ring-accent/50"
            placeholder="Your name"
          />
        </div>

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

      {/* GitHub Sign Up */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleGitHubSignUp}
        disabled={isLoading}
      >
        Sign up with GitHub
      </Button>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-accent hover:text-accent-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
