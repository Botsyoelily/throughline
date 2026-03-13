import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Throughline",
  description:
    "A privacy nudge copilot that projects the downstream consequences of data-sharing decisions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

