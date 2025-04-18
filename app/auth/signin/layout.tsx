import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Sign In | CalorieWatcher",
  description: "Sign in to your CalorieWatcher account",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 