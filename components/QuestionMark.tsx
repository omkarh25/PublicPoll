"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface QuestionMarkProps {
  size?: number;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  neonMode?: boolean;
}

export default function QuestionMark({
  size = 120,
  className = "",
  animate = true,
  onClick,
  neonMode = false,
}: QuestionMarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !containerRef.current) return;

    const tl = gsap.timeline();

    // Float animation
    tl.to(containerRef.current, {
      y: -12,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Glow pulse
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.1,
        duration: 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }

    return () => {
      tl.kill();
    };
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Glow backdrop */}
      <div
        ref={glowRef}
        className={`absolute inset-0 rounded-full ${
          neonMode
            ? "bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-lime opacity-60 blur-xl"
            : "bg-white/10 blur-xl"
        }`}
      />

      {/* Main circle */}
      <div
        className={`relative w-full h-full rounded-full flex items-center justify-center border-2 transition-transform duration-300 hover:scale-105 ${
          neonMode
            ? "bg-black border-neon-cyan animate-glow-cyan"
            : "bg-white/5 border-white/20 backdrop-blur-sm"
        }`}
        style={
          neonMode
            ? {
                boxShadow:
                  "0 0 30px rgba(0,255,255,0.4), inset 0 0 30px rgba(0,255,255,0.1)",
              }
            : {}
        }
      >
        <span
          className={`font-black leading-none ${
            neonMode
              ? "text-[min(25vw,200px)] animate-color-cycle"
              : "text-white text-6xl"
          }`}
          style={
            neonMode
              ? {}
              : {
                  fontSize: size * 0.55,
                  textShadow: "0 0 20px rgba(255,255,255,0.5)",
                }
          }
        >
          ?
        </span>
      </div>
    </div>
  );
}
