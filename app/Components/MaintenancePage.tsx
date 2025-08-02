"use client"
import { Wrench, Clock, HardDrive, Server } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrenchRef = useRef<SVGSVGElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animations
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Wrench animation - continuous rotation with pulse
      gsap.to(wrenchRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
      });

      // Icons animation - staggered appearance
      gsap.from(iconsRef.current?.children || [], {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.5,
        ease: "back.out",
      });

      // Text animation
      gsap.from(textRef.current?.children || [], {
        opacity: 0,
        y: 10,
        duration: 0.6,
        stagger: 0.15,
        delay: 1,
        ease: "power2.out",
      });

      // Background elements animation
      const circles = [];
      for (let i = 0; i < 5; i++) {
        const circle = document.createElement("div");
        circle.className = "absolute rounded-full border border-gray-800";
        circle.style.width = `${Math.random() * 300 + 100}px`;
        circle.style.height = circle.style.width;
        circle.style.left = `${Math.random() * 100}%`;
        circle.style.top = `${Math.random() * 100}%`;
        containerRef.current?.appendChild(circle);
        circles.push(circle);

        gsap.to(circle, {
          x: `${Math.random() * 100 - 50}px`,
          y: `${Math.random() * 100 - 50}px`,
          duration: Math.random() * 10 + 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      return () => {
        circles.forEach(circle => containerRef.current?.removeChild(circle));
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center overflow-hidden relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-yellow-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl"></div>
      </div>

      <div className="max-w-md space-y-6 relative z-10">
        <div className="flex justify-center">
          <Wrench 
            ref={wrenchRef} 
            className="h-16 w-16 text-red-500 animate-pulse" 
          />
        </div>

        <div ref={textRef}>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
            Under Maintenance
          </h1>
          <p className="text-lg text-gray-400 mt-4">
            We're currently performing scheduled maintenance to improve your experience.
            Our team is working hard to bring everything back online as soon as possible.
          </p>
        </div>

        <div 
          ref={iconsRef}
          className="flex justify-center gap-6 pt-6"
        >
          <div className="flex flex-col items-center">
            <Clock className="h-8 w-8 text-blue-400" />
            <span className="text-xs mt-2 text-gray-400">ESTIMATED TIME</span>
          </div>
          <div className="flex flex-col items-center">
            <HardDrive className="h-8 w-8 text-green-400" />
            <span className="text-xs mt-2 text-gray-400">SYSTEMS UPDATE</span>
          </div>
          <div className="flex flex-col items-center">
            <Server className="h-8 w-8 text-purple-400" />
            <span className="text-xs mt-2 text-gray-400">SERVER WORK</span>
          </div>
        </div>

        <div className="pt-8">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Progress: 65% • Expected completion: {new Date(Date.now() + 3600000).toLocaleString()}
          </p>
        </div>

        <div className="pt-6">
          <Button 
            className="px-6 py-2 border border-red-500 bg-gradient-to-b-to r from-red-600 to bg-red-900 text-white rounded-full hover:bg-yellow-500/10 transition-colors duration-300"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}