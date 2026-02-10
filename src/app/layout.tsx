import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediaForge - Advanced Video Processing",
  description: "Merge videos and clean audio with AI-powered tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
