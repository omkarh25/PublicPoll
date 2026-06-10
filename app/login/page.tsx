"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const qmarkRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/polls");
    }
  }, [user, loading, router]);

  // Entrance animation
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Question mark scales in from nothing
      gsap.fromTo(
        qmarkRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)", delay: 0.2 }
      );

      // Subtle continuous rotation
      gsap.to(qmarkRef.current, {
        rotation: 5,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const handleLogin = async () => {
    // Animate click
    gsap.to(qmarkRef.current, {
      scale: 0.8,
      duration: 0.15,
      ease: "power2.in",
      onComplete: async () => {
        await signInWithGoogle();
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-neon-magenta/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Question Mark */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          ref={qmarkRef}
          onClick={handleLogin}
          className="cursor-pointer group"
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 scale-150" />
          
          {/* Main circle */}
          <div
            className="relative w-[min(40vw,280px)] h-[min(40vw,280px)] rounded-full flex items-center justify-center border-2 border-neon-cyan/60 bg-black/80 backdrop-blur-sm transition-all duration-500 group-hover:border-neon-magenta group-hover:shadow-[0_0_80px_rgba(255,0,255,0.4)]"
            style={{
              boxShadow: "0 0 40px rgba(0,255,255,0.2), inset 0 0 40px rgba(0,255,255,0.05)",
            }}
          >
            {/* Inner ring */}
            <div className="absolute inset-4 rounded-full border border-neon-lime/20 group-hover:border-neon-lime/40 transition-colors" />
            
            {/* The ? */}
            <span
              className="font-black text-[min(22vw,160px)] leading-none select-none animate-color-cycle"
              style={{
                background: "linear-gradient(135deg, #00ffff, #ff00ff, #39ff14, #00ffff)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-shift 3s ease infinite",
              }}
            >
              ?
            </span>
          </div>
        </div>

        {/* Login text */}
        <p className="mt-10 text-gray-400 text-sm tracking-widest uppercase animate-pulse">
          Click to Sign In with Google
        </p>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 text-xs text-gray-700">
        PublicPoll — Secure • Anonymous • Your Voice
      </div>

    </div>
  );
}
