"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage after a brief delay
    const redirectTimer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900">
      <div className="text-center max-w-xl px-5">
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-indigo-200 mb-8">Redirecting you to the homepage...</p>
        <div className="w-16 h-1 bg-indigo-500 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
} 