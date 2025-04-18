import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CalorieWatcher",
  description: "View your nutrition dashboard and daily stats",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9333EA",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 