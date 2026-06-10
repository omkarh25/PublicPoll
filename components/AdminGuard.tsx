"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userRole !== "admin") {
        router.push("/polls");
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return null;
  }

  return <>{children}</>;
}
