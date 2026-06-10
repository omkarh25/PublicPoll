"use client";

import { useState, useEffect } from "react";
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
import { Send, MessageCircle, User } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState<Map<number, number>>(new Map());
  const [totalVotes, setTotalVotes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Check if user already voted
  useEffect(() => {
    if (!user || !poll) return;
    getUserVote(poll.id, user.uid).then((vote) => {
      if (vote) {
        setHasVoted(true);
        setSelectedOption(vote.optionIndex);
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

  // Load comments (always visible)
  useEffect(() => {
    if (!poll) return;
    setLoadingComments(true);
    getComments(poll.id)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }, [poll]);

  const handleVote = async (optionIndex: number) => {
    if (!user || hasVoted || isSubmittingVote) return;
    setIsSubmittingVote(true);
    try {
      await submitVote(poll.id, user.uid, optionIndex);
      setSelectedOption(optionIndex);
      setHasVoted(true);
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Poll Card */}
      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
          hasVoted ? "shadow-[0_0_40px_rgba(0,255,255,0.08)]" : "shadow-[0_0_40px_rgba(0,255,255,0.04)]"
        }`}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-br from-neon-cyan/40 via-neon-magenta/30 to-neon-lime/20 pointer-events-none" />

        <div className="relative bg-[#0f0f0f] rounded-2xl">
          {/* Top bar with category and vote count */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              {poll.category}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Question */}
          <div className="px-6 py-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              {poll.question}
            </h2>
          </div>

          {/* Options OR Results */}
          <div className="px-6 pb-6 space-y-3">
            {poll.options.map((option, index) => {
              const pct = getPercentage(index);
              const isSelected = selectedOption === index;
              const isWinner = winningIndex === index && totalVotes > 0;

              return (
                <div key={index} className="relative">
                  {/* Progress bar background (shown after voting) */}
                  {hasVoted && (
                    <div
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      style={{ zIndex: 0 }}
                    >
                      <div
                        className={`h-full rounded-xl transition-all duration-700 ease-out ${
                          isSelected
                            ? "bg-gradient-to-r from-neon-cyan/15 to-neon-lime/10"
                            : "bg-white/[0.03]"
                        }`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleVote(index)}
                    disabled={hasVoted || isSubmittingVote}
                    className={`relative w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left font-medium transition-all duration-300 ${
                      hasVoted
                        ? isSelected
                          ? "border-neon-cyan/40 text-white cursor-default"
                          : "border-white/5 text-gray-400 cursor-default"
                        : "border-white/10 text-gray-200 hover:border-neon-cyan/40 hover:bg-neon-cyan/5 hover:text-white cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,255,0.06)]"
                    }`}
                    style={{ zIndex: 1 }}
                  >
                    {/* Option letter */}
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        hasVoted
                          ? isSelected
                            ? "bg-neon-cyan text-black"
                            : "bg-white/5 text-gray-500"
                          : "bg-white/5 text-gray-400 group-hover:bg-neon-cyan/20"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>

                    {/* Option text */}
                    <span className="flex-1 text-base md:text-lg">{option}</span>

                    {/* Percentage (shown after voting) */}
                    {hasVoted && (
                      <div className="flex items-center gap-2">
                        {isWinner && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neon-lime">
                            Leading
                          </span>
                        )}
                        <span
                          className={`text-lg font-bold ${
                            isSelected ? "text-neon-cyan" : "text-gray-500"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Vote count text below bar */}
                  {hasVoted && (
                    <p className="text-xs text-gray-600 mt-1 ml-14">
                      {voteCounts.get(index) || 0} vote
                      {(voteCounts.get(index) || 0) !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Vote confirmation */}
            {hasVoted && selectedOption !== null && (
              <div className="mt-4 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/15">
                <p className="text-sm text-neon-cyan font-medium">
                  You voted: {poll.options[selectedOption]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section — Always visible below */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
        <div className="relative bg-[#0f0f0f] rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle className="w-5 h-5 text-neon-magenta" />
            <h3 className="text-lg font-bold text-white">
              Comments
            </h3>
            <span className="text-sm text-gray-500">
              ({comments.length})
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-10 h-10 rounded-full border border-dark-border flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-neon-cyan" />
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-magenta/30 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-2.5 bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta rounded-xl hover:bg-neon-magenta/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {loadingComments ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-gray-800 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  No comments yet. Start the conversation!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  {comment.userPhotoURL ? (
                    <img
                      src={comment.userPhotoURL}
                      alt=""
                      className="w-9 h-9 rounded-full border border-dark-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-neon-magenta/10 border border-neon-magenta/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neon-magenta">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-200">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {comment.createdAt?.toDate
                          ? comment.createdAt.toDate().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Just now"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
