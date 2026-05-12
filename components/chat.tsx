"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowUp, Sparkles, Loader2, CheckCircle, XCircle, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolStatus = "running" | "done" | "error";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "tool"; tool: string; input: unknown; status: ToolStatus; result?: string };

type Props = {
  projectId: Id<"projects">;
  onBusyChange?: (busy: boolean) => void;
};

export function Chat({ projectId, onBusyChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Planning the next cut… Décris ce que tu veux — retrait des silences, captions, musique de fond, rythme.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const removeSilences = useAction(api.tools.removeSilences);
  const addCaptions    = useAction(api.tools.addCaptions);
  const generateMusic  = useAction(api.tools.generateMusic);

  useEffect(() => { onBusyChange?.(pending); }, [pending, onBusyChange]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    switch (name) {
      case "remove_silences": {
        const r = await removeSilences({ projectId, padding_ms: (input.padding_ms as number | undefined) ?? 150 });
        return (r as { message?: string }).message ?? "Silences retirés.";
      }
      case "add_captions": {
        const r = await addCaptions({ projectId, style: (input.style as string | undefined) ?? "minimal" });
        return (r as { message?: string }).message ?? "Captions ajoutées.";
      }
      case "generate_music": {
        const r = await generateMusic({ projectId, description: input.description as string, durationSeconds: (input.duration_seconds as number | undefined) ?? 20 });
        return (r as { message?: string }).message ?? "Musique générée.";
      }
      default:
        return `Outil "${name}" non encore implémenté.`;
    }
  }

  function stop() { abortRef.current?.abort(); }

  async function send() {
    if (!input.trim() || pending) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    const sent = input;
    setInput("");
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message: sent, history: messages.filter((m) => m.role !== "tool") }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errText = data?.error ?? `HTTP ${res.status}`;
        setMessages((m) => [...m, { role: "assistant", content: `Erreur : ${errText}` }]);
        return;
      }

      if (data.text) setMessages((m) => [...m, { role: "assistant", content: data.text }]);

      for (const tc of data.toolCalls ?? []) {
        const toolMsg: Message = { role: "tool", tool: tc.name, input: tc.input, status: "running" };
        setMessages((m) => [...m, toolMsg]);

        try {
          const result = await executeTool(tc.name, tc.input as Record<string, unknown>);
          setMessages((m) => m.map((msg, i) =>
            i === m.length - 1 && msg.role === "tool" ? { ...msg, status: "done" as ToolStatus, result } : msg
          ));
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setMessages((m) => m.map((msg, i) =>
            i === m.length - 1 && msg.role === "tool" ? { ...msg, status: "error" as ToolStatus, result: errMsg } : msg
          ));
        }
      }
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      setMessages((m) => [...m, {
        role: "assistant",
        content: isAbort ? "Annulé." : `Erreur : ${e instanceof Error ? e.message : String(e)}`,
      }]);
    } finally {
      window.clearTimeout(timeoutId);
      abortRef.current = null;
      setPending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(20px)" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="shrink-0 border-b px-4 py-3.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6B35]" strokeWidth={1.75} />
          <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#F5F5F5]">
            DIRECTOR
          </span>

          {pending ? (
            <button
              type="button"
              onClick={stop}
              className="ml-auto flex items-center gap-1.5 rounded-md border border-[#FF6B35]/25 bg-[#FF6B35]/08 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-[#FF6B35]/80 transition hover:bg-[#FF6B35]/14"
              title="Annuler"
            >
              <Square className="h-2 w-2 fill-current" />
              STOP
            </button>
          ) : (
            <span className="ml-auto rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-[#7A7A7A]">
              READY
            </span>
          )}
        </div>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.04em] text-[#4A4A4A]">
          {pending ? "Exécution en cours…" : "Langage naturel → montage."}
        </p>
      </div>

      {/* ── Messages ───────────────────────────────────────── */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => {
          if (m.role === "tool") {
            const icon =
              m.status === "running" ? <Loader2 className="h-3 w-3 animate-spin text-[#FF6B35]" /> :
              m.status === "done"    ? <CheckCircle className="h-3 w-3 text-[#5ee2a0]" /> :
                                       <XCircle className="h-3 w-3 text-red-400/80" />;
            return (
              <div
                key={i}
                className="rounded-xl border p-3"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  {icon}
                  <span className="font-mono text-[10px] tracking-[0.08em] text-[#7A7A7A]">{m.tool}</span>
                </div>
                {m.result && (
                  <p className="font-mono text-[10px] leading-relaxed text-[#4A4A4A]">{m.result}</p>
                )}
              </div>
            );
          }
          return (
            <div key={i} className="space-y-1.5">
              <div className="font-mono text-[9px] tracking-[0.18em] text-[#4A4A4A]">
                {m.role === "user" ? "YOU" : "DIRECTOR"}
              </div>
              <p className={cn(
                "text-[13px] leading-relaxed",
                m.role === "user" ? "text-[#F5F5F5]" : "text-[#7A7A7A]",
              )}>
                {m.content}
              </p>
            </div>
          );
        })}
        {pending && (
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-[#4A4A4A]">
            <Loader2 className="h-3 w-3 animate-spin text-[#FF6B35]" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────── */}
      <div className="shrink-0 border-t p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="rounded-xl p-2 transition-all focus-within:ring-1"
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
            }}
            placeholder="Retire les silences, ajoute des captions, génère de la musique…"
            rows={3}
            disabled={pending}
            className="w-full resize-none bg-transparent px-2 py-1.5 text-[13px] leading-relaxed text-[#F5F5F5] placeholder:text-[#4A4A4A] focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-0.5">
            <span className="font-mono text-[9px] tracking-[0.1em] text-[#4A4A4A]">
              CLAUDE · SONNET 4.6
            </span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={!input.trim() || pending}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
              aria-label="Send"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
