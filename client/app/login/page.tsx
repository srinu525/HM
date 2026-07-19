"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    redirected.current = true;
    const savedSlug = localStorage.getItem("orgSlug");
    router.replace(savedSlug ? `/${savedSlug}/login` : "/default-hospital/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}
