import type { Metadata } from "next";

import { NotFoundPage } from "@/components/static/NotFoundPage";

export const metadata: Metadata = {
  title: "Page Not Found — Vodora",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
