"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileQuestion,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  List,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/components/AuthProvider";
import {
  getSubmissions,
  reviewSubmission,
  createPoll,
  type Submission,
} from "@/lib/firestore";

type FilterTab = "pending" | "approved" | "rejected" | "all";

function QuestionsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data =
        filter === "all"
          ? await getSubmissions()
          : await getSubmissions(filter);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: Submission) => {
    if (!user) return;
    setReviewing(submission.id);
    try {
      await reviewSubmission(submission.id, "approved", user.uid, reviewNote);
      // Create the actual poll
      await createPoll({
        question: submission.question,
        options: submission.options,
        category: submission.category,
        createdBy: submission.submittedBy,
        status: "active",
        totalVotes: 0,
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, status: "approved", reviewedBy: user.uid }
            : s
        )
      );
      setActiveReviewId(null);
      setReviewNote("");
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  const handleReject = async (submission: Submission) => {
    if (!user) return;
    setReviewing(submission.id);
    try {
      await reviewSubmission(submission.id, "rejected", user.uid, reviewNote);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, status: "rejected", reviewedBy: user.uid }
            : s
        )
      );
      setActiveReviewId(null);
      setReviewNote("");
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  const tabs: { key: FilterTab; label: string; icon: typeof Clock }[] = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle },
    { key: "rejected", label: "Rejected", icon: XCircle },
    { key: "all", label: "All", icon: List },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20";
      case "approved":
        return "bg-neon-lime/10 text-neon-lime border-neon-lime/20";
      case "rejected":
        return "bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
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
            <FileQuestion className="w-5 h-5 text-neon-magenta" />
            <h1 className="text-lg font-bold text-white">Questions</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? "bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta"
                  : "bg-dark-card border border-dark-border text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No {filter !== "all" ? filter : ""} submissions.
          </p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-dark-card border border-dark-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                      {sub.question}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span>{sub.options.join(" / ")}</span>
                      <span>•</span>
                      <span className="uppercase">{sub.category}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      By {sub.submitterName} •{" "}
                      {sub.createdAt?.toDate
                        ? sub.createdAt.toDate().toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                      sub.status
                    )}`}
                  >
                    {sub.status}
                  </span>
                </div>

                {/* Actions for pending */}
                {sub.status === "pending" && (
                  <div className="mt-4 pt-3 border-t border-dark-border">
                    {activeReviewId === sub.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Optional review note..."
                          className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(sub)}
                            disabled={reviewing === sub.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-neon-lime/10 border border-neon-lime/30 text-neon-lime rounded-lg text-sm font-medium hover:bg-neon-lime/20 transition-colors disabled:opacity-40"
                          >
                            {reviewing === sub.id ? (
                              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub)}
                            disabled={reviewing === sub.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta rounded-lg text-sm font-medium hover:bg-neon-magenta/20 transition-colors disabled:opacity-40"
                          >
                            {reviewing === sub.id ? (
                              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setActiveReviewId(null);
                              setReviewNote("");
                            }}
                            className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveReviewId(sub.id)}
                          className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminQuestionsPage() {
  return (
    <AdminGuard>
      <QuestionsManagement />
    </AdminGuard>
  );
}
