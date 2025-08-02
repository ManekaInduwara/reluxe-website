// app/not-found.tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Frown, Home, RotateCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const homeButtonRef = useRef<HTMLButtonElement>(null);
  const reloadButtonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const errorDetailsRef = useRef<HTMLDivElement>(null);

  // Create error particles
  const createParticles = () => {
    if (!particlesRef.current) return;

    particlesRef.current.innerHTML = '';
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-red-500 rounded-full';
      
      gsap.set(particle, {
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        scale: Math.random() * 2 + 0.5,
        opacity: 0
      });

      particlesRef.current.appendChild(particle);

      gsap.to(particle, {
        opacity: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 2 + 1,
        y: `+=${Math.random() * 100 - 50}`,
        x: `+=${Math.random() * 100 - 50}`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  };

  // Handle reload action
  const handleReload = () => {
    setIsReloading(true);
    gsap.to(reloadButtonRef.current, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'none',
      onComplete: () => {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };

  // Handle home navigation
  const handleGoHome = () => {
    gsap.to([homeButtonRef.current, reloadButtonRef.current], {
      opacity: 0,
      y: 20,
      duration: 0.3
    });
    
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => router.push('/')
    });
  };

  // Initialize animations
  useLayoutEffect(() => {
    createParticles();
    
    const ctx = gsap.context(() => {
      // Initial hidden state
      gsap.set([titleRef.current, textRef.current, iconRef.current, homeButtonRef.current, reloadButtonRef.current, errorDetailsRef.current], {
        opacity: 0,
        y: 30
      });

      // Background pulse effect
      gsap.to(containerRef.current, {
        backgroundColor: '#0a0a0a',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Animation timeline
      const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
      
      tl.to(iconRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scale: 1.2
      })
      .to(iconRef.current, {
        scale: 1,
        duration: 0.4
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.4')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')
      .to([homeButtonRef.current, reloadButtonRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1
      }, '-=0.2')
      .to(errorDetailsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, '-=0.1');

      // Continuous icon animation
      gsap.to(iconRef.current, {
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Hover effect for buttons
      const buttons = [homeButtonRef.current, reloadButtonRef.current];
      buttons.forEach(button => {
        if (!button) return;
        
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            scale: 1.05,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
            duration: 0.2
          });
        });
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            scale: 1,
            boxShadow: 'none',
            duration: 0.2
          });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Error icon with animation */}
      <div className="relative mb-8">
        <Frown 
          ref={iconRef}
          className="w-20 h-20 text-red-500"
        />
        <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping opacity-0" />
      </div>
      
      {/* Error title with glitch effect */}
      <h1 
        ref={titleRef}
        className="text-6xl md:text-8xl font-bold text-white mb-4 relative"
      >
        <span className="text-red-500">404</span>
        <span className="absolute left-0 top-0 text-red-500 opacity-20 animate-glitch">404</span>
      </h1>
      
      {/* Error message */}
      <h2 
        ref={textRef}
        className="text-3xl md:text-4xl text-white mb-6 font-medium"
      >
        Page Not <span className="text-red-500">Found</span>
      </h2>
      
      {/* Error details (appears after main animation) */}
      <div 
        ref={errorDetailsRef}
        className="text-gray-300 mb-8 max-w-md text-sm md:text-base"
      >
        <AlertCircle className="inline w-4 h-4 mr-2" />
        The requested URL was not found on this server.
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          ref={homeButtonRef}
          onClick={handleGoHome}
          className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Home className="w-5 h-5" />
          Return Home
        </button>
        
        <button
          ref={reloadButtonRef}
          onClick={handleReload}
          disabled={isReloading}
          className="px-6 py-3 bg-transparent text-white border border-gray-600 rounded-md hover:bg-gray-900 transition-all duration-300 flex items-center gap-2"
        >
          <RotateCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Reloading...' : 'Try Again'}
        </button>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-gray-500 text-xs">
        Need help? Contact contact@reluxe.store
        </div>

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.5s infinite;
        }
      `}</style>
    </div>
  );
}