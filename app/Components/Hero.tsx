'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { client } from '@/sanity/lib/client'
import SplitText from '@/Animations/SplitText/SplitText'

gsap.registerPlugin(ScrollTrigger)

interface HeroData {
  videoUrl?: string
  title?: string
  subtitle?: string
  tagline?: string
  ctaText?: string
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const titleWords = heroData?.title?.split(' ') || ['RELUXE', 'CLOTHING' ]

  useEffect(() => {
    client.fetch("*[_type == 'heroImage'][0]").then(setHeroData)
  }, [])

  useEffect(() => {
    if (!containerRef.current || !heroData) return

    // Animation timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Title animation - iconic reveal
    tl.fromTo(".title-word",
      { 
        y: 120,
        opacity: 0,
        skewY: 15,
        rotationX: 45
      },
      {
        y: 0,
        opacity: 1,
        skewY: 0,
        rotationX: 0,
        stagger: 0.15,
        duration: 1.5,
        transformOrigin: "50% 100%"
      }
    )

    // Subtitle animation - elegant fade in
    tl.fromTo(".hero-subtitle",
      {
        y: 60,
        opacity: 0,
        filter: "blur(10px)"
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2
      },
      "-=1.0" // Overlap with title animation
    )

    // Tagline animation - subtle reveal
    tl.fromTo(".hero-tagline",
      {
        y: 40,
        opacity: 0,
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)"
      },
      {
        y: 0,
        opacity: 0.9,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        duration: 1.2,
        ease: "power2.out"
      },
      "-=0.8"
    )

    // CTA button animation - pop effect
    tl.fromTo(".hero-cta",
      {
        scale: 0.8,
        opacity: 0,
        y: 30
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      },
      "-=0.5"
    )

    // Continuous floating effect
    gsap.to(".title-word", {
      y: -15,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2
    })

    // Scroll-triggered animations
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom top",
      animation: gsap.to(".hero-content > *", {
        y: -80,
        opacity: 0,
        stagger: 0.1,
        duration: 1
      }),
      scrub: true
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [heroData])

  if (!heroData) return null

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Full-screen video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroData.videoUrl} type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      {/* Hero content container */}
      <div className="hero-content absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">

        {/* Main title with dramatic reveal */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight">
          <SplitText
  text="RELUXE CLOTHING."
  className="text-5xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight  text-center"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
/>
        </h1>
<SplitText
  text="ELEVATE EVRY LOOK."
  className="text-2xl font-semibold text-center"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
/>
        {/* Subtitle - supporting statement */}
        {heroData.subtitle && (
          <h2 className="hero-subtitle text-xl md:text-3xl font-medium mb-6 opacity-0">
            {heroData.subtitle}
          </h2>
        )}

        {/* Tagline - additional context */}
        {heroData.tagline && (
          <p className="hero-tagline text-base md:text-lg max-w-2xl mx-auto mb-8 opacity-0 leading-relaxed">
            {heroData.tagline}
          </p>
        )}

        {/* Call-to-action button */}
        {heroData.ctaText && (
          <button className="hero-cta bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors opacity-0">
            {heroData.ctaText}
          </button>
        )}

        {/* Animated scroll indicator */}
       <div className="absolute bottom-8 flex flex-col items-center">
          <div className="scroll-arrow h-8 w-px bg-white/80 mb-2" />
          <span className="text-sm text-white/80">SCROLL TO EXPLORE</span>
        </div>
      </div>

      {/* Overlay with reduced opacity */}
      <div className="absolute inset-0 bg-black/20" />
    </section>
  )
}