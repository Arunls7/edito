"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowUp, Sparkles, Wrench, Loader2, CheckCircle, XCircle, Square } from "lucide-react";
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
      content:
        "Planning the next cut… Décris ce que tu veux — retrait des silences, captions, musique de fond, rythme.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const removeSilences = useAction(api.tools.removeSilences);
  const addCaptions = useAction(api.tools.addCaptions);
  const generateMusic = useAction(api.tools.generateMusic);

  useEffect(() => {
    onBusyChange?.(pending);
  }, [pending, onBusyChange]);

  async function executeTool(
    name: string,
    input: Record<string, unknown>
  ): Promise<string> {
    switch (name) {
      case "remove_silences":
        const r1 = await removeSilences({
          projectId,
          padding_ms: (input.padding_ms as number | undefined) ?? 150,
        });
        return (r1 as { message?: string }).message ?? "Silences retirés.";

      case "add_captions":
        const r2 = await addCaptions({
          projectId,
          style: (input.style as string | undefined) ?? "minimal",
        });
        return (r2 as { message?: string }).message ?? "Captions ajoutées.";

      case "generate_music":
        const r3 = await generateMusic({
          projectId,
          description: input.description as string,
          durationSeconds: (input.duration_seconds as number | undefined) ?? 20,
        });
        return (r3 as { message?: string }).message ?? "Musique générée.";

      default:
        return `Outil "${name}" non encore implémenté.`;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

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
        body: JSON.stringify({
          projectId,
          message: sent,
          history: messages.filter((m) => m.role !== "tool"),
        }),
      });
      const data = await res.json();

      if (data.text) {
        setMessages((m) => [...m, { role: "assistant", content: data.text }]);
      }

      // Execute each tool call sequentially, updating status live
      for (const tc of data.toolCalls ?? []) {
        const toolMsg: Message = {
          role: "tool",
          tool: tc.name,
          input: tc.input,
          status: "running",
        };
        setMessages((m) => [...m, toolMsg]);

        try {
          const result = await executeTool(tc.name, tc.input as Record<string, unknown>);
          setMessages((m) =>
            m.map((msg, i) =>
              i === m.length - 1 && msg.role === "tool"
                ? { ...msg, status: "done" as ToolStatus, result }
                : msg
            )
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setMessages((m) =>
            m.map((msg, i) =>
              i === m.length - 1 && msg.role === "tool"
                ? { ...msg, status: "error" as ToolStatus, result: errMsg }
                : msg
            )
          );
        }
      }
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: isAbort
            ? "Annulé."
            : `Erreur : ${e instanceof Error ? e.message : String(e)}`,
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      abortRef.current = null;
      setPending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#121214]/95 backdrop-blur-md">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold tracking-tight text-white/95">
            Director
          </span>
          {pending ? (
            <button
              type="button"
              onClick={stop}
              className="ml-auto flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100/90 transition hover:bg-amber-500/20"
              title="Annuler"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
              Stop
            </button>
          ) : (
            <span className="ml-auto rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/90">
              Ready
            </span>
          )}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-white/45">
          {pending
            ? "Exécution en cours…"
            : "Décris les modifications en langage naturel."}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => {
          if (m.role === "tool") {
            const icon =
              m.status === "running" ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              ) : m.status === "done" ? (
                <CheckCircle className="h-3 w-3 text-emerald-400" />
              ) : (
                <XCircle className="h-3 w-3 text-red-400" />
              );
            return (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-black/35 p-3 text-xs font-mono shadow-inner shadow-black/40"
              >
                <div className="mb-1 flex items-center gap-1.5 text-white/70">
                  {icon}
                  <span className="text-[var(--color-green)]">{m.tool}</span>
                </div>
                {m.result && (
                  <p className="mt-1 text-[11px] text-white/55">{m.result}</p>
                )}
              </div>
            );
          }
          return (
            <div key={i} className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                {m.role === "user" ? "You" : "Director"}
              </div>
              <p
                className={cn(
                  "text-[13px] leading-relaxed",
                  m.role === "user" ? "text-white/90" : "text-white/55",
                )}
              >
                {m.content}
              </p>
            </div>
          );
        })}
        {pending && (
          <div className="flex items-center gap-2 text-[13px] text-white/45">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="rounded-xl border border-white/[0.1] bg-[#18181c]/90 p-2 shadow-inner shadow-black/50 focus-within:border-white/[0.18]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Retire les silences, ajoute des captions, génère de la musique…"
            rows={3}
            disabled={pending}
            className="w-full resize-none bg-transparent px-2 py-2 text-[13px] text-white/90 placeholder:text-white/35 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-black/40 px-2 py-1 text-[10px] font-medium text-white/55">
              Claude Sonnet 4.6
            </span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={!input.trim() || pending}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#121214] shadow-md transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
