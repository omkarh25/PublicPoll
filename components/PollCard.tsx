'use client';

import { useState, useEffect } from 'react';

/**
 * Poll Card Component
 * Displays daily poll question with voting, commenting, and sharing
 */

interface PollOption {
  index: number;
  text: string;
  percentage: number;
  count: number;
}

interface PollData {
  id: number;
  question_text: string;
  options: string[];
  category: string;
}

interface PollCardProps {
  poll: PollData;
  userId: number;
  initialUserVote?: number;
  initialVoteCounts?: { option_index: number; count: number }[];
}

export default function PollCard({ poll, userId, initialUserVote, initialVoteCounts = [] }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(initialUserVote ?? null);
  const [hasVoted, setHasVoted] = useState(!!initialUserVote);
  const [voteCounts, setVoteCounts] = useState<{ [key: number]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Initialize vote counts
  useEffect(() => {
    const counts: { [key: number]: number } = {};
    let total = 0;
    initialVoteCounts.forEach((vc) => {
      counts[vc.option_index] = vc.count;
      total += vc.count;
    });
    setVoteCounts(counts);
    setTotalVotes(total);
  }, [initialVoteCounts]);

  // Load comments
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments?questionId=${poll.id}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  // Handle voting
  const handleVote = async (optionIndex: number) => {
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: poll.id,
          optionIndex,
        }),
      });

      if (res.ok) {
        setSelectedOption(optionIndex);
        setHasVoted(true);
        
        // Update local vote counts
        setVoteCounts((prev) => ({
          ...prev,
          [optionIndex]: (prev[optionIndex] || 0) + 1,
        }));
        setTotalVotes((prev) => prev + 1);
        
        console.log(`[Poll] Vote submitted for option ${optionIndex}`);
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: poll.id,
          commentText: newComment,
        }),
      });

      if (res.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: 'PublicPoll - Karnataka',
      text: poll.question_text,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${poll.question_text}\n\nVote at: ${window.location.origin}`);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  // Calculate percentage
  const getPercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    return Math.round(((voteCounts[optionIndex] || 0) / totalVotes) * 100);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      traffic: 'bg-orange-100 text-orange-700',
      infrastructure: 'bg-blue-100 text-blue-700',
      law_enforcement: 'bg-red-100 text-red-700',
      sanitation: 'bg-green-100 text-green-700',
      governance: 'bg-purple-100 text-purple-700',
      transport: 'bg-yellow-100 text-yellow-700',
      environment: 'bg-emerald-100 text-emerald-700',
      healthcare: 'bg-pink-100 text-pink-700',
      safety: 'bg-cyan-100 text-cyan-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(poll.category)}`}>
            {poll.category.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-gray-500">📊 Daily Poll</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{poll.question_text}</h2>
        <p className="text-sm text-gray-500 mt-2">{totalVotes} votes • {comments.length} comments</p>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleVote(index)}
            disabled={hasVoted}
            className={`w-full relative flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              hasVoted
                ? selectedOption === index
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
            } ${hasVoted ? 'cursor-default' : ''}`}
          >
            {/* Option text */}
            <span className={`font-medium ${selectedOption === index ? 'text-primary-700' : 'text-gray-700'}`}>
              {option}
            </span>

            {/* Percentage (shown after voting) */}
            {hasVoted && (
              <span className="text-sm font-semibold text-gray-600">
                {getPercentage(index)}%
              </span>
            )}

            {/* Progress bar background */}
            {hasVoted && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-primary-500 transition-all duration-500 rounded-full"
                style={{ width: `${getPercentage(index)}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="px-6 pb-4 flex gap-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        
        <button
          onClick={handleShare}
          className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
          {showShareTooltip && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap">
              Copied to clipboard!
            </span>
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Comments ({comments.length})</h3>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {comment.aadhaar_number.slice(0, 4)}****{comment.aadhaar_number.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
