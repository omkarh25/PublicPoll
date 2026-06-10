"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Vote as VoteIcon, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserVotes, getUserComments } from "@/lib/firestore";
import type { Poll, Vote, Comment } from "@/lib/firestore";

interface VoteEntry {
  pollId: string;
  vote: Vote;
  poll: Poll;
}

interface CommentEntry {
  comment: Comment;
  pollId: string;
  poll: Poll;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [votes, setVotes] = useState<VoteEntry[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"votes" | "comments">("votes");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    Promise.all([getUserVotes(user.uid), getUserComments(user.uid)])
      .then(([v, c]) => {
        setVotes(v);
        setComments(c);
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/polls")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
          <button
            onClick={logout}
            className="text-sm text-neon-magenta hover:text-neon-magenta/80 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* User Card */}
        <div className="gradient-border p-6 mb-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-16 h-16 rounded-full border-2 border-neon-cyan/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border-2 border-neon-cyan/30 flex items-center justify-center text-2xl font-bold text-neon-cyan">
                {user.displayName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {user.displayName || "User"}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <VoteIcon className="w-3.5 h-3.5 text-neon-cyan" />
                  {votes.length} votes
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MessageSquare className="w-3.5 h-3.5 text-neon-magenta" />
                  {comments.length} comments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("votes")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "votes"
                ? "bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan"
                : "bg-dark-card border border-dark-border text-gray-400 hover:text-white"
            }`}
          >
            My Votes
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "comments"
                ? "bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta"
                : "bg-dark-card border border-dark-border text-gray-400 hover:text-white"
            }`}
          >
            My Comments
          </button>
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "votes" ? (
          votes.length === 0 ? (
            <div className="text-center py-12">
              <VoteIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No votes yet</p>
              <button
                onClick={() => router.push("/polls")}
                className="mt-3 text-sm text-neon-cyan hover:underline"
              >
                Start voting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {votes.map((entry) => (
                <div
                  key={entry.pollId}
                  className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-neon-cyan/20 transition-colors cursor-pointer"
                  onClick={() => router.push("/polls")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-2">
                        {entry.poll.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Category: {entry.poll.category}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-xs font-semibold whitespace-nowrap">
                      {entry.poll.options[entry.vote.optionIndex]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <button
              onClick={() => router.push("/polls")}
              className="mt-3 text-sm text-neon-magenta hover:underline"
            >
              Start commenting
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((entry) => (
              <div
                key={entry.comment.id}
                className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-neon-magenta/20 transition-colors cursor-pointer"
                onClick={() => router.push("/polls")}
              >
                <p className="text-sm text-gray-300 mb-2">{entry.comment.text}</p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  On: {entry.poll.question}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-600">
                  <Calendar className="w-3 h-3" />
                  {entry.comment.createdAt?.toDate
                    ? entry.comment.createdAt.toDate().toLocaleDateString()
                    : "Recently"}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
