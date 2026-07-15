import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Rehearse — practice hard conversations",
  description:
    "Rehearse the conversations and decisions that scare you, with an AI that pushes back.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
