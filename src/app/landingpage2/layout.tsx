import { LandingSmoothScroll } from "@/components/landing/shared/LandingSmoothScroll";

export default function LandingPage2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LandingSmoothScroll>{children}</LandingSmoothScroll>;
}
