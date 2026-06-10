"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import QuestionMark from "@/components/QuestionMark";

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image entrance
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );

      // Dark overlay fades in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.3, ease: "power2.out" }
      );

      // Question mark entrance
      gsap.fromTo(
        ".landing-qmark",
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.8, ease: "back.out(1.7)" }
      );

      // Text entrance
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.4, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => router.push("/login"),
      });

      tl.to(textRef.current, { opacity: 0, y: -10, duration: 0.3 })
        .to(".landing-qmark", { scale: 1.8, opacity: 0, duration: 0.5, ease: "power2.in" }, "-=0.1")
        .to(overlayRef.current, { opacity: 0.95, duration: 0.5 }, "-=0.3")
        .to(imageRef.current, { scale: 1.1, duration: 0.8, ease: "power2.inOut" }, "<");
    }, containerRef);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div
        ref={imageRef}
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/cm_office.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0,
        }}
      />

      {/* Dark overlay for readability */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"
        style={{ opacity: 0 }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-20 px-4">
        {/* Big Question Mark */}
        <div className="mb-8 landing-qmark">
          <QuestionMark size={100} onClick={handleClick} />
        </div>

        {/* CTA Text */}
        <div ref={textRef} className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Public<span className="text-neon-cyan">Poll</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Tap the <span className="text-neon-magenta font-semibold">?</span> to begin
          </p>
        </div>
      </div>
    </div>
  );
}
