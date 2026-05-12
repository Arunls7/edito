"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ArrowUp, Sparkles, Loader2 } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const INITIAL: Message = {
  role: "assistant",
  content:
    "Bonjour ! Décris ton projet vidéo — donne-moi un titre ou une idée, et je crée le projet pour toi.",
};

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const createEmpty = useMutation(api.projects.createEmpty);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setPending(true);

    try {
      const projectId = await createEmpty({ title: text });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Projet "${text}" créé ! Redirection vers l'éditeur…`,
        },
      ]);
      setTimeout(() => router.push(`/project/${projectId}`), 800);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Une erreur s'est produite — vérifie ta connexion et réessaie.",
        },
      ]);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm font-semibold">Agent</span>
        <span className="ml-auto rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/90">
          Prêt
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 min-h-[120px] max-h-[260px]">
        {messages.map((m, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">
              {m.role === "user" ? "Toi" : "Agent"}
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {m.content}
            </p>
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-dim)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Création du projet…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] px-3 py-2 focus-within:border-[var(--color-border-light)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Ex : Montage vacances été 2024…"
            rows={2}
            disabled={pending}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() || pending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Envoyer"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
