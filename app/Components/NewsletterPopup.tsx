'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MailIcon, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

export default function NewsletterPopup({ newsletterImage }: { newsletterImage: any }) {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showAgain, setShowAgain] = useState(true)

  useEffect(() => {
    const hasInteracted = localStorage.getItem('newsletterInteracted')
    if (hasInteracted !== 'true' && showAgain) {
      const timer = setTimeout(() => setShow(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [showAgain])

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (res.ok) {
        setSubscribed(true)
        localStorage.setItem('newsletterInteracted', 'true')
        setTimeout(() => setShow(false), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShow(false)
    localStorage.setItem('newsletterInteracted', 'true')
  }

  const imageUrl = newsletterImage ? urlFor(newsletterImage).width(500).height(500).url() : null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-gray-950 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-800"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
              aria-label="Close newsletter popup"
            >
              <X className="w-5 h-5" />
            </button>

            {imageUrl && (
              <div className="flex justify-center mb-6">
                <Image
                  src={imageUrl}
                  alt={newsletterImage?.alt || "Newsletter subscription"}
                  width={500}
                  height={500}
                  className="rounded-lg object-cover aspect-square max-h-[120px] w-auto border border-gray-800"
                  priority
                />
              </div>
            )}

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-400" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-50">Thank You!</h2>
                <p className="mb-6 text-gray-400">
                  You've been successfully subscribed to our newsletter.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                  <MailIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-50">Join Our Newsletter</h2>
                <p className="mb-6 text-gray-400">
                  Get weekly updates on new products, exclusive offers, and design inspiration.
                </p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="py-5 px-4 rounded-lg bg-gray-900 border-gray-800 text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !email}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </span>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}