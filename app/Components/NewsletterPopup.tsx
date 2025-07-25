'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MailIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (res.ok) {
      setEmail('')
      setShow(false)   // ✅ Automatically close popup after success
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-black rounded-2xl p-6 max-w-md w-full text-center shadow-xl"
          >
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <Image
              src="/newsletter.png"  // 🔥 Replace with your actual image in /public/
              alt="Newsletter"
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-full"
            />

            <MailIcon className="mx-auto w-10 h-10 text-black mb-3" />
            <h2 className="text-2xl font-bold mb-2">Stay Updated!</h2>
            <p className="mb-4 text-sm text-gray-600">
              Get exclusive updates and offers directly to your inbox.
            </p>

            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mb-3"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Submitting...' : 'Subscribe'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
