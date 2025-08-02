'use client'

import { motion } from 'framer-motion'

export default function CookiesPolicyPage() {
  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-3xl mx-auto">
        {/* Animated Title */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-2"
          >
            Cookies Policy
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-16 h-1 bg-white mx-auto mb-8 origin-left"
          />
        </div>

        {/* Cookies Policy Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8 text-gray-300 text-sm sm:text-base leading-relaxed"
        >
          <p>
            This Cookies Policy explains how Reluxe ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website.
          </p>

          <h2 className="text-white font-semibold text-lg">What Are Cookies</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit a website. They help the website remember information about your visit, which can make it easier to visit the site again and make the site more useful to you.
          </p>

          <h2 className="text-white font-semibold text-lg">How We Use Cookies</h2>
          <p>
            We use cookies for several purposes:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
            <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization</li>
            <li><strong>Marketing Cookies:</strong> Used to track visitors across websites for advertising purposes</li>
          </ul>

          <h2 className="text-white font-semibold text-lg">Cookie Duration</h2>
          <p>
            Cookies may be either "persistent" cookies or "session" cookies. Persistent cookies remain on your device for the period of time specified in the cookie, while session cookies are deleted when you close your web browser.
          </p>

          <h2 className="text-white font-semibold text-lg">Managing Cookies</h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
          </p>

          <h2 className="text-white font-semibold text-lg">Third-Party Cookies</h2>
          <p>
            We may also use various third-party cookies for analytics, performance, and marketing purposes. These cookies are set by domains other than our website.
          </p>

          <h2 className="text-white font-semibold text-lg">Changes to This Policy</h2>
          <p>
            We may update this Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated "Last Updated" date.
          </p>
 

          <p className="mt-8 text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </div>
    </div>
  )
}