import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Rushly — Agentic Video Rushlyr",
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
          colorPrimary: "#ff7a45",
          colorBackground: "#131316",
          colorText: "#f5f5f7",
          colorInputBackground: "#18181c",
          colorInputText: "#f5f5f7",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
