"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ArrowUp, Sparkles, Loader2, Paperclip, X, Film } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const INITIAL: Message = {
  role: "assistant",
  content:
    "Glisse tes rushs ici ou clique sur 📎, décris ce que tu veux faire, et je m'occupe du reste.",
};

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const createProject = useMutation(api.projects.create);
  const createEmpty = useMutation(api.projects.createEmpty);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pickFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      alert("Format vidéo uniquement (mp4, mov, webm…)");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      alert("Fichier trop lourd (max 500 MB)");
      return;
    }
    setFile(f);
  }, []);

  async function send() {
    const text = input.trim();
    if ((!text && !file) || pending) return;

    const userContent = [
      file ? `📎 ${file.name}` : null,
      text || null,
    ]
      .filter(Boolean)
      .join(" — ");

    setMessages((m) => [...m, { role: "user", content: userContent }]);
    setInput("");
    setPending(true);
    setProgress(0);

    try {
      let projectId: Id<"projects">;

      if (file) {
        const title = text || file.name.replace(/\.[^.]+$/, "");

        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Upload de "${file.name}" en cours…` },
        ]);

        const uploadUrl = await generateUploadUrl();
        const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const { storageId: sid } = JSON.parse(xhr.responseText) as {
                storageId: string;
              };
              resolve(sid as Id<"_storage">);
            } else reject(new Error(`Upload failed: ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });

        projectId = await createProject({
          title,
          storageId,
          sizeBytes: file.size,
          mimeType: file.type,
        });
      } else {
        projectId = await createEmpty({ title: text });
      }

      setFile(null);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Projet créé ! Redirection vers l'éditeur…",
        },
      ]);
      setTimeout(() => router.push(`/project/${projectId}`), 700);
    } catch (err) {
      console.error(err);
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

  const canSend = (!!input.trim() || !!file) && !pending;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) pickFile(f);
      }}
      className={`flex flex-col rounded-xl border overflow-hidden transition ${
        dragOver
          ? "border-[var(--color-accent)] bg-[var(--color-accent-glow)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm font-semibold">Agent</span>
        <span
          className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            pending
              ? "border-amber-500/35 bg-amber-500/10 text-amber-100/90"
              : "border-emerald-500/35 bg-emerald-500/10 text-emerald-100/90"
          }`}
        >
          {pending ? "En cours" : "Prêt"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 min-h-[140px] max-h-[280px]">
        {dragOver && (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-accent)] py-6 text-sm text-[var(--color-accent)]">
            Dépose ta vidéo ici
          </div>
        )}
        {!dragOver &&
          messages.map((m, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">
                {m.role === "user" ? "Toi" : "Agent"}
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                {m.content}
              </p>
            </div>
          ))}
        {pending && progress > 0 && progress < 100 && (
          <div className="space-y-1">
            <div className="w-full h-1 rounded-full bg-[var(--color-bg-panel)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] text-[var(--color-text-dim)]">
              {Math.round(progress)}%
            </div>
          </div>
        )}
        {pending && (progress === 0 || progress >= 100) && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-dim)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {file && progress === 0 ? "Préparation…" : "Création du projet…"}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* File chip */}
      {file && (
        <div className="px-3 pb-0 pt-1">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-panel)] px-3 py-1.5 text-xs">
            <Film className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="max-w-[200px] truncate text-[var(--color-text-muted)]">
              {file.name}
            </span>
            <span className="text-[var(--color-text-dim)]">
              ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-1 text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]"
              aria-label="Retirer le fichier"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-[var(--color-border)] p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] px-3 py-2 focus-within:border-[var(--color-border-light)]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="shrink-0 text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] disabled:opacity-35 transition"
            aria-label="Joindre une vidéo"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={
              file
                ? "Décris ce que tu veux faire avec ce rush…"
                : "Décris ton projet ou glisse une vidéo ici…"
            }
            rows={2}
            disabled={pending}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
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
