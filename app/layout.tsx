import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "Choco Design Studio",
  description: "Let’s have a tea for two. A personal portfolio and static AI fashion demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteShell>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
