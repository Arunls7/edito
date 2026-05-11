"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex =
  convexUrl && convexUrl.length > 0 ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center text-[var(--color-text-muted)]">
        <p>
          Ajoute{" "}
          <code className="text-[var(--color-text)]">NEXT_PUBLIC_CONVEX_URL</code> dans{" "}
          <code className="text-[var(--color-text)]">.env.local</code>, puis lance{" "}
          <code className="text-[var(--color-text)]">npx convex dev</code>.
        </p>
      </div>
    );
  }

  if (!hasClerkPublishableConfig()) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
