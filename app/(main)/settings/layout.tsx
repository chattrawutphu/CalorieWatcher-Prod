import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Settings | CalorieWatcher",
  description: "Configure your CalorieWatcher account and preferences",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9333EA",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 