"use client";

import { useEffect } from "react";

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
