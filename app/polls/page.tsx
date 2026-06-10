"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Shield, BarChart3, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getActivePolls, type Poll } from "@/lib/firestore";
import PollCard from "@/components/PollCard";
import SubmitQuestionDialog from "@/components/SubmitQuestionDialog";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    scale: 0.96,
  }),
};

export default function PollsPage() {
  const router = useRouter();
  const { user, userRole, loading, logout } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingPolls(true);
    getActivePolls()
      .then((data) => {
        setPolls(data);
        setCurrentIndex(0);
        setPage([0, 0]);
      })
      .catch(console.error)
      .finally(() => setLoadingPolls(false));
  }, [user]);

  const paginate = useCallback(
    (newDirection: number) => {
      const newIndex = currentIndex + newDirection;
      if (newIndex >= 0 && newIndex < polls.length) {
        setPage([page + newDirection, newDirection]);
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex, polls.length, page]
  );

  const handleEnd = () => {
    setShowDialog(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

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
      <header className="bg-dark-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">
                Public<span className="text-neon-cyan">Poll</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {userRole === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="p-2 rounded-lg hover:bg-white/5 text-neon-magenta transition-colors"
                title="Admin"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDialog(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-magenta transition-colors"
              title="End"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-magenta transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-8">
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
            {/* Poll Counter */}
            <div className="mb-4 text-center">
              <span className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase">
                Poll {currentIndex + 1} / {polls.length}
              </span>
            </div>

            {/* Carousel */}
            <div className="w-full relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentPoll?.id || page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 350, damping: 32 },
                    opacity: { duration: 0.18 },
                    scale: { duration: 0.18 },
                  }}
                >
                  {currentPoll && (
                    <PollCard
                      poll={currentPoll}
                      onNext={() => paginate(1)}
                      onPrev={() => paginate(-1)}
                      hasNext={currentIndex < polls.length - 1}
                      hasPrev={currentIndex > 0}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-6 mt-6 md:hidden">
              <button
                onClick={() => paginate(-1)}
                disabled={currentIndex === 0}
                className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 disabled:opacity-20 transition-colors"
              >
                <span className="text-lg">&#8592;</span>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {polls.slice(0, Math.min(polls.length, 12)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const diff = i - currentIndex;
                      if (diff !== 0) paginate(diff);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentIndex
                        ? "w-5 h-2 bg-neon-cyan"
                        : "w-2 h-2 bg-white/10"
                    }`}
                  />
                ))}
                {polls.length > 12 && (
                  <span className="text-[10px] text-gray-700 ml-1">+{polls.length - 12}</span>
                )}
              </div>

              <button
                onClick={() => paginate(1)}
                disabled={currentIndex === polls.length - 1}
                className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 disabled:opacity-20 transition-colors"
              >
                <span className="text-lg">&#8594;</span>
              </button>
            </div>

            {/* Desktop Dots */}
            <div className="hidden md:flex items-center justify-center gap-1.5 mt-6">
              {polls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i - currentIndex;
                    if (diff !== 0) paginate(diff);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentIndex
                      ? "w-5 h-2 bg-neon-cyan"
                      : "w-2 h-2 bg-white/10 hover:bg-white/20"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Submit Dialog */}
      <SubmitQuestionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
