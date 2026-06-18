import type { Metadata } from "next";

import { AccessDeniedToast } from "@/components/auth/AccessDeniedToast";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppToaster } from "@/components/ui/AppToaster";

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
        <QueryProvider>
          <SiteChrome>{children}</SiteChrome>
        </QueryProvider>
        <AppToaster />
        <AccessDeniedToast />
      </body>
    </html>
  );
}
