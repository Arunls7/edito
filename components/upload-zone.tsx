"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Upload, Loader2 } from "lucide-react";

export function UploadZone() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const createProject = useMutation(api.projects.create);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        alert("Format vidéo uniquement (mp4, mov, webm…)");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        alert("Fichier trop lourd (max 500 MB pour le MVP)");
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        // 1. Demander à Convex une URL d'upload signée
        const uploadUrl = await generateUploadUrl();

        // 2. POST le fichier (avec progress via XHR)
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

        // 3. Créer le projet avec ce storageId
        const projectId = await createProject({
          title: file.name.replace(/\.[^.]+$/, ""),
          storageId,
          sizeBytes: file.size,
          mimeType: file.type,
        });

        router.push(`/project/${projectId}`);
      } catch (err) {
        console.error(err);
        alert("Erreur upload — vérifie ta connexion et réessaie");
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, createProject, router]
  );

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
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`relative rounded-xl border-2 border-dashed p-12 text-center transition ${
        dragOver
          ? "border-[var(--color-accent)] bg-[var(--color-accent-glow)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-light)]"
      }`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          <div className="text-sm text-[var(--color-text-muted)]">
            Upload… {Math.round(progress)}%
          </div>
          <div className="w-full max-w-xs h-1 rounded-full bg-[var(--color-bg-panel)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <Upload className="h-8 w-8 text-[var(--color-text-dim)]" />
          <div className="text-sm">
            <span className="font-medium">Glisse une vidéo ici</span>
            <span className="text-[var(--color-text-muted)]"> ou clique pour parcourir</span>
          </div>
          <div className="text-xs text-[var(--color-text-dim)]">
            MP4, MOV, WebM — jusqu&apos;à 500 MB
          </div>
        </div>
      )}
    </div>
  );
}
