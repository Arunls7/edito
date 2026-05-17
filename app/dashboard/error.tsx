"use client";

import { useEffect } from "react";

const isPlanError = (msg: string) =>
  msg.includes("exceeded the free plan") || msg.includes("deployments have been disabled");

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  if (isPlanError(error.message)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-8 text-center">
        <div className="max-w-md">
          <div
            className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl"
            style={{ background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)" }}
          >
            ⚠
          </div>
          <h1 className="mb-2 text-lg font-semibold text-[#F5F5F5]">
            Convex plan limit reached
          </h1>
          <p className="mb-6 font-mono text-[12px] leading-relaxed text-[#7A7A7A]">
            Your Convex free plan deployment has been disabled. Upgrade to Pro to continue.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://dashboard.convex.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
              style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
            >
              Upgrade on Convex dashboard →
            </a>
            <button
              onClick={reset}
              className="font-mono text-[11px] text-[#4A4A4A] hover:text-[#7A7A7A] transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F5F5F5", fontFamily: "monospace", padding: "2rem" }}>
      <h1 style={{ color: "#FF6B35", marginBottom: "1rem", fontSize: "1rem" }}>Dashboard Error</h1>
      <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "11px", color: "#ccc", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {error.message}
        {"\n\n"}
        {error.stack}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#FF6B35", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
      >
        Retry
      </button>
    </div>
  );
}
