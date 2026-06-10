"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { createSubmission } from "@/lib/firestore";
import { useAuth } from "@/components/AuthProvider";

interface SubmitQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "traffic",
  "infrastructure",
  "law_enforcement",
  "sanitation",
  "governance",
  "transport",
  "environment",
  "healthcare",
  "safety",
  "education",
  "digital",
  "agriculture",
  "commerce",
  "welfare",
  "general",
];

export default function SubmitQuestionDialog({
  isOpen,
  onClose,
}: SubmitQuestionDialogProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("Yes");
  const [option2, setOption2] = useState("No");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createSubmission({
        question: question.trim(),
        options: [option1.trim() || "Yes", option2.trim() || "No"],
        category,
        submittedBy: user.uid,
        submitterName: user.displayName || "Anonymous",
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuestion("");
    setOption1("Yes");
    setOption2("No");
    setCategory("general");
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <h2 className="text-lg font-bold text-white">
            {submitted ? "Submitted!" : "Submit Your Question"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center">
              <Send className="w-7 h-7 text-neon-lime" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Question Submitted!
            </h3>
            <p className="text-gray-400 text-sm">
              Your question is under review. An admin will approve it shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/20 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Should traffic police be banned from collecting cash fines?"
                rows={3}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                required
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Option A
                </label>
                <input
                  type="text"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Option B
                </label>
                <input
                  type="text"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!question.trim() || submitting}
              className="w-full py-3 bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30 text-white font-semibold rounded-xl hover:from-neon-cyan/30 hover:to-neon-magenta/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Question
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
