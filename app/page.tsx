"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Skip authentication and go directly to dashboard
    router.push("/dashboard");
  }, [router]);

  // Empty page as we're redirecting immediately
  return null;
}
