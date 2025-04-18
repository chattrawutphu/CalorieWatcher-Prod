import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Meals | CalorieWatcher",
  description: "View and manage your meal history and nutrition data",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9333EA",
};

export default function MealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 