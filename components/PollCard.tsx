"use client";

import { useState, useEffect, useRef } from "react";
import {
  submitVote,
  getUserVote,
  getComments,
  addComment,
  subscribeToVoteCounts,
  type Poll,
  type Comment,
} from "@/lib/firestore";
import { useAuth } from "@/components/AuthProvider";
import { Send, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";

interface PollCardProps {
  poll: Poll;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function PollCard({ poll, onNext, onPrev, hasNext, hasPrev }: PollCardProps) {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState<Map<number, number>>(new Map());
  const [totalVotes, setTotalVotes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Reset state when poll changes
  useEffect(() => {
    setFlipped(false);
    setHasVoted(false);
    setSelectedOption(null);
    setComments([]);
    setNewComment("");
  }, [poll.id]);

  // Check if user already voted
  useEffect(() => {
    if (!user || !poll) return;
    getUserVote(poll.id, user.uid).then((vote) => {
      if (vote) {
        setHasVoted(true);
        setSelectedOption(vote.optionIndex);
        setFlipped(true);
      }
    });
  }, [user, poll]);

  // Subscribe to real-time vote counts
  useEffect(() => {
    if (!poll) return;
    const unsub = subscribeToVoteCounts(poll.id, (counts, total) => {
      setVoteCounts(counts);
      setTotalVotes(total);
    });
    return () => unsub();
  }, [poll]);

  // Load comments when flipped
  useEffect(() => {
    if (!flipped || !poll) return;
    setLoadingComments(true);
    getComments(poll.id)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }, [flipped, poll]);

  const handleVote = async (optionIndex: number) => {
    if (!user || hasVoted || isSubmittingVote) return;
    setIsSubmittingVote(true);
    try {
      await submitVote(poll.id, user.uid, optionIndex);
      setSelectedOption(optionIndex);
      setHasVoted(true);
      setFlipped(true);
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      await addComment(poll.id, {
        uid: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || "",
        text: newComment.trim(),
      });
      setNewComment("");
      const updated = await getComments(poll.id);
      setComments(updated);
      setTimeout(() => {
        commentsRef.current?.scrollTo({ top: commentsRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getPercentage = (index: number) => {
    if (totalVotes === 0) return 0;
    const count = voteCounts.get(index) || 0;
    return Math.round((count / totalVotes) * 100);
  };

  const winningIndex =
    totalVotes > 0
      ? poll.options.reduce((best, _, i) => {
          const bestCount = voteCounts.get(best) || 0;
          const currCount = voteCounts.get(i) || 0;
          return currCount > bestCount ? i : best;
        }, 0)
      : -1;

  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ perspective: "1500px" }}>
      {/* Carousel Side Arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all duration-300 hidden md:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all duration-300 hidden md:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* 3D Flip Card */}
      <div
        className="relative w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* FRONT FACE */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-neon-cyan/30 via-white/10 to-neon-magenta/20 pointer-events-none" />

          <div className="relative bg-[#0c0c0c] rounded-2xl p-8 md:p-12 lg:p-14">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/15">
                {poll.category}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-10">
              {poll.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  disabled={isSubmittingVote}
                  className="group w-full flex items-center gap-4 px-6 py-5 rounded-2xl border border-white/10 bg-white/[0.02] text-gray-200 text-left font-medium text-lg transition-all duration-300 hover:border-neon-cyan/30 hover:bg-neon-cyan/[0.03] hover:shadow-[0_0_30px_rgba(0,255,255,0.04)] active:scale-[0.98]"
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/5 text-gray-400 font-bold text-sm flex items-center justify-center transition-colors group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 w-full rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-neon-lime/20 via-white/10 to-neon-cyan/20 pointer-events-none" />

          <div className="relative h-full bg-[#0c0c0c] rounded-2xl flex flex-col p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <span className="px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full bg-neon-lime/10 text-neon-lime border border-neon-lime/15">
                Results
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Question */}
            <h3 className="text-lg font-semibold text-white/80 leading-snug mb-5 flex-shrink-0">
              {poll.question}
            </h3>

            {/* Results Bars */}
            <div className="space-y-3 mb-5 flex-shrink-0">
              {poll.options.map((option, index) => {
                const pct = getPercentage(index);
                const isSelected = selectedOption === index;
                const isWinner = winningIndex === index && totalVotes > 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isSelected ? "text-neon-cyan" : "text-gray-300"}`}>
                        {option}
                      </span>
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-neon-lime">
                            Leading
                          </span>
                        )}
                        <span className={`text-sm font-bold ${isSelected ? "text-neon-cyan" : "text-gray-500"}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isSelected ? "bg-gradient-to-r from-neon-cyan to-neon-lime" : "bg-white/15"
                        }`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-700 mt-0.5">
                      {voteCounts.get(index) || 0} vote{(voteCounts.get(index) || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5 mb-4 flex-shrink-0" />

            {/* Comments Header */}
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-neon-magenta" />
              <span className="text-sm font-semibold text-white">Comments</span>
              <span className="text-xs text-gray-600">({comments.length})</span>
            </div>

            {/* Comments List (scrollable) */}
            <div
              ref={commentsRef}
              className="flex-1 overflow-y-auto space-y-2 min-h-[80px] mb-4 pr-1"
              style={{ maxHeight: "200px" }}
            >
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-700 text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 p-2.5 rounded-xl bg-white/[0.02]">
                    {comment.userPhotoURL ? (
                      <img src={comment.userPhotoURL} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neon-magenta/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-neon-magenta">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-gray-300">{comment.userName}</span>
                        <span className="text-[9px] text-gray-700">
                          {comment.createdAt?.toDate
                            ? comment.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-neon-magenta/30 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-2.5 bg-neon-magenta/10 border border-neon-magenta/25 text-neon-magenta rounded-xl hover:bg-neon-magenta/20 transition-colors disabled:opacity-30"
              >
                {isSubmittingComment ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
