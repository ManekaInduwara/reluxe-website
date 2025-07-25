'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GsapScroll({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Register ScrollTrigger for the container
      gsap.registerPlugin(ScrollTrigger);

      // Animate elements with the class "gsap-scroll"
      gsap.utils.toArray<HTMLElement>(".gsap-scroll").forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
        });
      });

      // More complex animations can be added here
      gsap.utils.toArray<HTMLElement>(".gsap-scale").forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          scale: 0.8,
          opacity: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
        });
      });
    }, container);

    return () => ctx.revert(); // cleanup
  }, []);

  return <div ref={container}>{children}</div>;
}