"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

interface QuickActionButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  action: string;
}

/**
 * Client component wrapper for quick action buttons with tracking
 */
export function QuickActionButton({
  href,
  variant = "secondary",
  size = "md",
  children,
  action,
}: QuickActionButtonProps) {
  const handleClick = () => {
    track("quick_action_clicked", {
      action,
    });
  };

  return (
    <Button variant={variant} size={size} asChild>
      <Link href={href} onClick={handleClick}>
        {children}
      </Link>
    </Button>
  );
}

