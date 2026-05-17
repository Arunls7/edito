"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#0A0A0A", color: "#F5F5F5", fontFamily: "monospace", padding: "2rem" }}>
        <h1 style={{ color: "#FF6B35", marginBottom: "1rem" }}>Application Error</h1>
        <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "12px", color: "#F5F5F5" }}>
          {error.message}
          {"\n\n"}
          {error.stack}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#FF6B35", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
