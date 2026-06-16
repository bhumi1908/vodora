import type { Metadata } from "next";

import { SiteChrome } from "@/components/layout/SiteChrome";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vodora — Professional Trust & References",
  description:
    "Build your portable Reference Passport. Own your verified references and share them with recruiters in one click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
