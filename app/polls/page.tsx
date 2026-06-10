"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield, BarChart3 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getActivePolls, type Poll } from "@/lib/firestore";
import PollCard from "@/components/PollCard";
import PollNavigator from "@/components/PollNavigator";
import SubmitQuestionDialog from "@/components/SubmitQuestionDialog";

export default function PollsPage() {
  const router = useRouter();
  const { user, userRole, loading, logout } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load polls
  useEffect(() => {
    if (!user) return;
    setLoadingPolls(true);
    getActivePolls()
      .then((data) => {
        setPolls(data);
        setCurrentIndex(0);
      })
      .catch(console.error)
      .finally(() => setLoadingPolls(false));
  }, [user]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < polls.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handleEnd = () => {
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const currentPoll = polls[currentIndex];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">
                Public<span className="text-neon-cyan">Poll</span>
              </p>
              <p className="text-[10px] text-gray-600 font-medium tracking-wide uppercase">
                Your voice matters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {userRole === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="p-2.5 rounded-xl hover:bg-white/5 text-neon-magenta transition-colors"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => router.push("/profile")}
              className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-neon-magenta transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-32">
        {loadingPolls ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-500 text-lg">No active polls right now.</p>
            <button
              onClick={() => setShowDialog(true)}
              className="mt-6 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl font-semibold hover:bg-neon-cyan/20 transition-colors"
            >
              Submit a Question
            </button>
          </div>
        ) : (
          <>
            {/* Poll Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                  Poll {currentIndex + 1} of {polls.length}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                What's your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">take?</span>
              </h1>
            </div>

            {currentPoll && (
              <PollCard
                key={currentPoll.id}
                poll={currentPoll}
              />
            )}
          </>
        )}
      </main>

      {/* Navigator */}
      {polls.length > 0 && (
        <PollNavigator
          currentIndex={currentIndex}
          total={polls.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onEnd={handleEnd}
        />
      )}

      {/* Submit Dialog */}
      <SubmitQuestionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
