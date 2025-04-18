import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Add Food | CalorieWatcher",
  description: "Add new meals and food items to your daily log",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9333EA",
};

export default function AddLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 