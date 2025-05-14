"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SyncRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/data");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">Redirecting to data management...</p>
    </div>
  );
} 