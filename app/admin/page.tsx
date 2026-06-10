"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  FileQuestion,
  Vote,
  Clock,
  Shield,
  Database,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/components/AuthProvider";
import { getAllUsers, getAllPolls, getSubmissions, seedPolls } from "@/lib/firestore";
import type { AppUser, Poll, Submission } from "@/lib/firestore";

function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolls: 0,
    totalVotes: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, polls, submissions] = await Promise.all([
          getAllUsers(),
          getAllPolls(),
          getSubmissions("pending"),
        ]);

        const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

        setStats({
          totalUsers: users.length,
          totalPolls: polls.length,
          totalVotes,
          pendingSubmissions: submissions.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      border: "border-neon-cyan/20",
    },
    {
      label: "Active Polls",
      value: stats.totalPolls,
      icon: FileQuestion,
      color: "text-neon-magenta",
      bg: "bg-neon-magenta/10",
      border: "border-neon-magenta/20",
    },
    {
      label: "Total Votes",
      value: stats.totalVotes,
      icon: Vote,
      color: "text-neon-lime",
      bg: "bg-neon-lime/10",
      border: "border-neon-lime/20",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingSubmissions,
      icon: Clock,
      color: "text-neon-yellow",
      bg: "bg-neon-yellow/10",
      border: "border-neon-yellow/20",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/polls")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Polls</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-magenta" />
            <h1 className="text-lg font-bold text-white">Admin</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`${card.bg} border ${card.border} rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="text-xs text-gray-400">{card.label}</span>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <h3 className="text-lg font-semibold text-white mb-4">Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/admin/users")}
            className="flex items-center gap-4 p-5 bg-dark-card border border-dark-border rounded-xl hover:border-neon-cyan/30 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Users</h4>
              <p className="text-sm text-gray-500">Manage user roles & accounts</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/admin/questions")}
            className="flex items-center gap-4 p-5 bg-dark-card border border-dark-border rounded-xl hover:border-neon-magenta/30 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-neon-magenta/10 flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-neon-magenta" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Questions</h4>
              <p className="text-sm text-gray-500">Approve or reject submissions</p>
            </div>
          </button>
        </div>

        {/* Seed Data */}
        <div className="mt-8 pt-6 border-t border-dark-border">
          <h3 className="text-lg font-semibold text-white mb-4">Data</h3>
          {seedMessage && (
            <div className={`mb-3 px-4 py-2 rounded-lg text-sm font-medium ${
              seedMessage.includes("Error")
                ? "bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta"
                : "bg-neon-lime/10 border border-neon-lime/30 text-neon-lime"
            }`}>
              {seedMessage}
            </div>
          )}
          <button
            onClick={async () => {
              if (!user) return;
              setSeeding(true);
              setSeedMessage(null);
              try {
                const count = await seedPolls(user.uid);
                // Refresh stats
                const [users, polls, submissions] = await Promise.all([
                  getAllUsers(),
                  getAllPolls(),
                  getSubmissions("pending"),
                ]);
                setStats({
                  totalUsers: users.length,
                  totalPolls: polls.length,
                  totalVotes: polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0),
                  pendingSubmissions: submissions.length,
                });
                if (count > 0) {
                  setSeedMessage(`Created ${count} polls successfully!`);
                } else {
                  setSeedMessage("Polls already exist.");
                }
              } catch (err: any) {
                console.error(err);
                setSeedMessage("Error: " + (err.message || "Failed to seed polls"));
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-neon-lime/10 border border-neon-lime/30 text-neon-lime rounded-xl text-sm font-medium hover:bg-neon-lime/20 transition-colors disabled:opacity-40"
          >
            {seeding ? (
              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            Seed Initial Polls
          </button>
          <p className="text-xs text-gray-600 mt-2">
            Creates 20 default Karnataka-themed polls if none exist.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
