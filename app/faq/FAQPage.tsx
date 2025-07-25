'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What exactly is Reluxe?',
    answer: 'Reluxe is a premium lifestyle brand focused on delivering minimalist yet luxurious fashion and accessories designed with quality, comfort, and timeless style in mind.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit/debit cards, direct bank transfer and cash on delivery.'
  },
  {
    question: 'How long is delivery?',
    answer: 'Standard delivery usually takes 3–7 business days, depending on your location. You’ll receive tracking details once your order has shipped.'
  },
  {
    question: 'Can I return or exchange an item?',
    answer: 'Yes, you can request a return or exchange within 7 days of receiving your order. The item must be unworn, unused, and in original packaging. See our Refund Policy for more details.' 
 },
    {
        question: 'What should I do if I receive a damaged or incorrect item?',
        answer: 'We sincerely apologize for the inconvenience. Please contact us at contact@reluxe.store within 48 hours of receiving your order, along with photos of the issue.'
    },
    {
        question: 'Do you offer custom or personalized products?',
        answer: 'Yes, we occasionally offer limited custom editions. Follow us on Instagram @reluxe_lk or subscribe to our newsletter to stay updated.'
    }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          {/* Animated Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-2"
          >
            FAQ
          </motion.h1>

          {/* Animated Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-16 h-1 bg-white mx-auto mb-8 origin-left"
          />

          {/* Static Subtitle */}
          <p className="font-semibold text-base sm:text-lg">
            HAVE MORE QUESTIONS?
          </p>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Email our RELUXE Customer Support Team{' '}
            <a href="/contact" className="text-red-500 font-medium underline">
              HERE
            </a>
            .
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-700">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-4 flex items-center justify-between text-left font-semibold text-white"
              >
                <span className="text-sm sm:text-base">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-white flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-white flex-shrink-0" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pb-4 text-gray-400 text-sm sm:text-base"
                  >
                    <div>{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

