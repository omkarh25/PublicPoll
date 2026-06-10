"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PollNavigatorProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export default function PollNavigator({
  currentIndex,
  total,
  onPrev,
  onNext,
  onEnd,
}: PollNavigatorProps) {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="bg-dark-bg/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-gray-300 text-sm font-semibold hover:border-neon-cyan/30 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-gray-300 disabled:hover:bg-white/[0.02]"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {/* Poll counter */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(total, 8) }).map((_, i) => {
                const isActive = i === currentIndex;
                const isPassed = i < currentIndex;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-neon-cyan scale-125 shadow-[0_0_8px_rgba(0,255,255,0.5)]"
                        : isPassed
                        ? "bg-neon-cyan/30"
                        : "bg-white/10"
                    }`}
                  />
                );
              })}
              {total > 8 && (
                <span className="text-[10px] text-gray-600 ml-1">
                  +{total - 8}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-600 font-medium tracking-wide uppercase">
              {currentIndex + 1} / {total}
            </span>
          </div>

          {/* Next / End */}
          <div className="flex items-center gap-2">
            <button
              onClick={onEnd}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-neon-magenta/20 bg-neon-magenta/5 text-neon-magenta text-sm font-semibold hover:bg-neon-magenta/10 transition-all"
              title="End polls"
            >
              <X className="w-4 h-4" />
              End
            </button>

            <button
              onClick={onNext}
              disabled={currentIndex === total - 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-gray-300 text-sm font-semibold hover:border-neon-cyan/30 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:text-gray-300 disabled:hover:bg-white/[0.02]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
