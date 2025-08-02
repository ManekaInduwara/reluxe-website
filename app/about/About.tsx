'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { Instagram, Facebook } from 'lucide-react'
import { SiTiktok } from 'react-icons/si'

export default function AboutPage() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const controls = useAnimation()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-3xl mx-auto">

        {/* Animated Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold mb-4 text-center"
        >
          About Reluxe
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-16 h-1 bg-white mx-auto mb-8 origin-left"
        />

        {/* Content Sections with Scroll Reveal */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={sectionVariants}
          className="space-y-6 text-gray-400 text-sm sm:text-base"
        >
          <p>
            <span className="text-white font-medium">Reluxe</span> is a premium lifestyle brand focused on minimalist luxury. We craft timeless essentials blending comfort, style, and sophistication.
          </p>

          <h2 className="text-white font-semibold text-lg">Our Philosophy</h2>
          <p>
            We believe less is more. Our products are designed to be worn every day while maintaining an elevated sense of elegance.
          </p>

          <h2 className="text-white font-semibold text-lg">What Sets Us Apart</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="text-white font-medium">Minimalist Design:</span> Timeless styles built for everyday elegance.</li>
            <li><span className="text-white font-medium">Premium Materials:</span> Carefully sourced fabrics for comfort and durability.</li>
            <li><span className="text-white font-medium">Small-Batch Production:</span> Focused on quality, not quantity.</li>
          </ul>

          <h2 className="text-white font-semibold text-lg">Our Community</h2>
          <p>
            From local creators to international tastemakers, Reluxe is for those who value simplicity and luxury in daily life.
          </p>

          <h2 className="text-white font-semibold text-lg">Stay Connected</h2>
          <p>
            Follow us on social media for updates on launches, collaborations, and exclusive drops.
          </p>

          {/* Social Icons with Hover Animations */}
          <div className="flex justify-center gap-6 mt-4">
            <motion.a
              href="https://instagram.com/reluxe_lk"
              target="_blank"
              whileHover={{ scale: 1.3, color: '#EF4444' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Instagram className="w-6 h-6 text-white cursor-pointer" />
            </motion.a>
            <motion.a
              href="https://www.facebook.com/share/1AyDSDrBUf/?mibextid=wwXIfr"
              target="_blank"
              whileHover={{ scale: 1.3, color: '#EF4444' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Facebook className="w-6 h-6 text-white cursor-pointer" />
            </motion.a>
            <motion.a
              href="https://www.tiktok.com/@reluxe6"
              target="_blank"
              whileHover={{ scale: 1.3, color: '#EF4444' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <SiTiktok className="w-6 h-6 text-white cursor-pointer" />
            </motion.a>
          </div>

          <p className="mt-6 font-semibold text-base text-white">
            Have questions?{' '}
            <a href="/contact" className="text-red-500 underline font-medium">
              Contact us here
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  )
}
