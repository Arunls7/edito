"use client";

import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowUp, Sparkles, Wrench, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | {
      role: "tool";
      tool: string;
      input: unknown;
      status: "pending" | "done" | "error";
    };

type Props = {
  projectId: Id<"projects">;
  onBusyChange?: (busy: boolean) => void;
};

export function Chat({ projectId, onBusyChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Planning the next cut… Describe the story you want — silence removal, captions, pacing, mood.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    onBusyChange?.(pending);
  }, [pending, onBusyChange]);

  async function send() {
    if (!input.trim() || pending) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    const sent = input;
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: sent,
          history: messages.filter((m) => m.role !== "tool"),
        }),
      });
      const data = await res.json();

      const newMessages: Message[] = [];
      if (data.text) newMessages.push({ role: "assistant", content: data.text });
      if (data.toolCalls) {
        for (const tc of data.toolCalls) {
          newMessages.push({
            role: "tool",
            tool: tc.name,
            input: tc.input,
            status: "done",
          });
        }
      }
      setMessages((m) => [...m, ...newMessages]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong — try again." },
      ]);
    } finally {
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
          <span
            className={cn(
              "ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              pending
                ? "border-amber-500/35 bg-amber-500/10 text-amber-100/90"
                : "border-emerald-500/35 bg-emerald-500/10 text-emerald-100/90",
            )}
          >
            {pending ? "Thinking" : "Ready"}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-white/45">
          {pending
            ? "Planning the next cut…"
            : "Describe edits in plain language — cuts, captions, rhythm."}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => {
          if (m.role === "tool") {
            return (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-black/35 p-3 text-xs font-mono shadow-inner shadow-black/40"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[var(--color-green)]">
                  <Wrench className="h-3 w-3" />
                  {m.tool}
                </div>
                <pre className="overflow-x-auto text-[11px] text-white/55">
                  {JSON.stringify(m.input, null, 2)}
                </pre>
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
            placeholder="What story do you want to tell?"
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
