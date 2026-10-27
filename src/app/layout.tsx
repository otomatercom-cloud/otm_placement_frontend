import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

// Self-hosted (not next/font/google): serves Inter from our own bundle
// instead of fonts.googleapis.com — no external font request at build or
// runtime, which is both faster on slow networks and works in
// network-restricted build environments.

export const metadata: Metadata = {
  title: "Placement Console | Logic School of Management",
  description:
    "Placement cell console: candidate pipeline, interview slots and mock-interview scheduling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
