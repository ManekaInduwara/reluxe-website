// app/components/CategoryNotFound.tsx
'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { Grid, Search, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategoryNotFoundProps {
  attemptedSlug?: string;
}

export default function CategoryNotFound({ attemptedSlug }: CategoryNotFoundProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonRef2 = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, iconRef.current, messageRef.current, buttonRef.current, buttonRef2.current], {
        opacity: 0,
        y: 20
      });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.to(iconRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        rotation: '+=10'
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')
      .to(messageRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, '-=0.2')
      .to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, '-=0.1')
      .to(buttonRef2.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, '-=0.2');

      // Continuous subtle animation with red glow
      gsap.to(iconRef.current, {
        rotation: -5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Add pulsing red glow effect
      gsap.to(iconRef.current, {
        filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.7))',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-[family-name:var(--font-poppins)]"
    >
      <Grid 
        ref={iconRef}
        className="w-16 h-16 text-red-500 mb-6"
      />
      
      <h1 
        ref={titleRef}
        className="text-3xl md:text-4xl font-bold text-white mb-4"
      >
        <span className="text-red-500">404</span> Category Not Found
      </h1>
      
      <p 
        ref={messageRef}
        className="text-gray-300 mb-8 max-w-md"
      >
        {attemptedSlug 
          ? `The category "${attemptedSlug.replace(/-/g, ' ')}" doesn't exist.` 
          : 'No category was specified.'
        } browse our available categories.
      </p>
      
      <div className="flex gap-4">
        <button
          ref={buttonRef}
          onClick={() => router.back()}
          className="px-6 py-2 bg-transparent border border-white text-white rounded-md hover:bg-gray-900 hover:border-red-500 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          ref={buttonRef2}
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>
    </div>
  );
}