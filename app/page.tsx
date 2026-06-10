"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import QuestionMark from "@/components/QuestionMark";

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image entrance
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
      );

      // Question mark entrance with delay
      gsap.fromTo(
        ".landing-qmark",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.5, ease: "back.out(1.7)" }
      );

      // Text entrance
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);

    const ctx = gsap.context(() => {
      // Animate everything out
      const tl = gsap.timeline({
        onComplete: () => router.push("/login"),
      });

      tl.to(imageRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
      })
        .to(
          ".landing-qmark",
          {
            scale: 1.5,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
          },
          "-=0.3"
        )
        .to(
          textRef.current,
          {
            opacity: 0,
            y: -20,
            duration: 0.3,
          },
          "-=0.3"
        );
    }, containerRef);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-[#0d1117] to-dark-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* CM Office Image with Paper */}
        <div
          ref={imageRef}
          className="relative w-full aspect-[16/10] max-w-lg rounded-2xl overflow-hidden border border-dark-border shadow-2xl"
        >
          {/* Placeholder CM Office image */}
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative">
            {/* Desk surface */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#2a1810] to-[#3d2517]" />
            
            {/* Desk items */}
            <div className="absolute bottom-[15%] left-[20%] w-16 h-20 bg-[#1a1a1a] rounded shadow-lg border border-[#333]" />
            <div className="absolute bottom-[15%] right-[25%] w-12 h-8 bg-[#2a2a2a] rounded shadow-lg border border-[#333]" />
            
            {/* The Paper on desk */}
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-32 h-40 bg-[#f5f0e1] rounded-sm shadow-xl rotate-2">
              {/* Paper lines */}
              <div className="mt-6 mx-3 h-0.5 bg-gray-300 w-3/4" />
              <div className="mt-2 mx-3 h-0.5 bg-gray-300 w-2/3" />
              <div className="mt-2 mx-3 h-0.5 bg-gray-300 w-4/5" />
              <div className="mt-2 mx-3 h-0.5 bg-gray-300 w-1/2" />
              
              {/* Question Mark on Paper */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <QuestionMark size={48} animate={false} className="landing-qmark" />
              </div>
            </div>
            
            {/* Pen */}
            <div className="absolute bottom-[14%] right-[30%] w-1 h-16 bg-gradient-to-b from-[#c0c0c0] to-[#808080] rounded-full rotate-12 shadow-md" />
            
            {/* Lamp glow */}
            <div className="absolute top-[10%] right-[15%] w-20 h-20">
              <div className="w-full h-full rounded-full bg-yellow-200/10 blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-100/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Big Question Mark below image */}
        <div className="mt-8 mb-4 landing-qmark">
          <QuestionMark size={80} onClick={handleClick} />
        </div>

        {/* CTA Text */}
        <div ref={textRef} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Public<span className="text-neon-cyan">Poll</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Tap the <span className="text-neon-magenta font-semibold">?</span> to begin
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-600">
        Your voice shapes the future
      </div>
    </div>
  );
}
