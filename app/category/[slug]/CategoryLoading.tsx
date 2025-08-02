// app/components/CategoryLoading.tsx
'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function CategoryLoading() {
  const skeletonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!skeletonRef.current) return;

    const ctx = gsap.context(() => {
      // Pulse animation for skeleton loader
      const skeletonItems = skeletonRef.current?.querySelectorAll('.skeleton-item');
      if (skeletonItems) {
        gsap.to(skeletonItems, {
          opacity: 0.6,
          duration: 1,
          repeat: -1,
          yoyo: true,
          stagger: 0.1,
          ease: 'power1.inOut'
        });
      }
    }, skeletonRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={skeletonRef} className="container mx-auto px-4 py-8">
      {/* Category title skeleton */}
      <div className="skeleton-item h-10 w-1/3 bg-gray-200 rounded mb-8"></div>
      
      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-item bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}