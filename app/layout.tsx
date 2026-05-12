import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Rushly — Agentic Video Editor",
  description: "Décris l'édit, l'agent exécute. Captions, silences, montage — automatique.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasClerkConfig = hasClerkPublishableConfig();

  const content = (
    <html lang="fr">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );

  if (!hasClerkConfig) {
    return content;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FF6B35",
          colorBackground: "#0A0A0A",
          colorText: "#F5F5F5",
          colorInputBackground: "#111111",
          colorInputText: "#F5F5F5",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
