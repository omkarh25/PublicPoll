"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, User } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { getAllUsers, updateUserRole } from "@/lib/firestore";
import type { AppUser } from "@/lib/firestore";

function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUpdating(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-cyan" />
            <h1 className="text-lg font-bold text-white">Users</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.uid}
                className="flex items-center gap-4 p-4 bg-dark-card border border-dark-border rounded-xl"
              >
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {u.displayName || "Unnamed"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => toggleRole(u.uid, u.role)}
                    disabled={updating === u.uid}
                    className={`p-2 rounded-lg transition-colors ${
                      u.role === "admin"
                        ? "text-neon-magenta hover:bg-neon-magenta/10"
                        : "text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10"
                    }`}
                    title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                  >
                    {updating === u.uid ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersManagement />
    </AdminGuard>
  );
}
