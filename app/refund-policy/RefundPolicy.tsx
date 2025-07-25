'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RefundPolicyPage() {
  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-3xl mx-auto">
        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold mb-4 text-center"
        >
          Refund & Return Policy
        </motion.h1>

        {/* Animated Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-16 h-1 bg-white mx-auto mb-8 origin-left"
        />

        <div className="space-y-6 text-gray-400 text-sm sm:text-base">
          <p>
            At Reluxe, your satisfaction is our priority. If you're not fully satisfied with your purchase, we're here to help.
          </p>

          <h2 className="text-white font-semibold text-lg">Returns & Exchanges</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>You can request a return or exchange within <span className="text-white font-medium">7 days</span> of receiving your order.</li>
            <li>Items must be <span className="text-white font-medium">unworn, unused,</span> and returned in their original packaging.</li>
            <li>Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.</li>
          </ul>

          <h2 className="text-white font-semibold text-lg">Damaged / Incorrect Items</h2>
          <p>
            If you receive a damaged or incorrect item, please contact us at{' '}
            <Link href="mailto:contact@reluxe.store" className="text-red-500 underline font-medium">
              contact@reluxe.store
            </Link>{' '}
            within <span className="text-white font-medium">48 hours</span> of receiving your order. Include your order number and clear photos of the issue.
          </p>

          <h2 className="text-white font-semibold text-lg">Non-Returnable Items</h2>
          <p>
            Certain limited edition or personalized items may not be eligible for return. Please refer to product descriptions for specific exclusions.
          </p>

          <h2 className="text-white font-semibold text-lg">Refunds</h2>
          <p>
            Once we receive your return and inspect the item, we'll process your refund to your original payment method within <span className="text-white font-medium">7 business days</span>. You'll be notified via email once your refund is issued.
          </p>

          <p className="mt-6 font-semibold text-base text-white">
            Have more questions?{' '}
            <Link href="/contact" className="text-red-500 underline font-medium">
              Contact us here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
