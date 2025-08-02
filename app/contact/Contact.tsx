'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      })
      setFormData({ name: '', email: '', message: '' })

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-3xl mx-auto">
        {/* Animated Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center animate-fade-in">
          Contact Reluxe
        </h1>

        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-8 animate-scale-x" />

        <div className="space-y-8 text-gray-400 text-sm sm:text-base">
          <p className="text-center text-gray-300 max-w-lg mx-auto animate-fade-in">
            We'd love to hear from you. Reach out through any of our channels or send us a message directly.
          </p>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Card */}
            <div className="contact-card animate-card-in bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-center border border-gray-800 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
                  <Mail className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2 text-lg">Email Us</h3>
              <a 
                href="mailto:contact@reluxe.com" 
                className="text-red-400 hover:text-red-300 transition-colors font-light"
              >
                contact@reluxe.store
              </a>
            </div>

            {/* Phone Card */}
            <div className="contact-card animate-card-in bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-center border border-gray-800 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg animation-delay-100">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
                  <Phone className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2 text-lg">Call Us</h3>
              <a 
                href="tel:+94728762428" 
                className="text-red-400 hover:text-red-300 transition-colors font-light"
              >
              +94 72 876 2428
              </a>
            </div>

            {/* Location Card */}
            <div className="contact-card animate-card-in bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-center border border-gray-800 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg animation-delay-200">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gray-800 rounded-full border border-gray-700">
                  <MapPin className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2 text-lg">Visit Us</h3>
              <p className="text-gray-300 font-light">
               Thalalla<br/>
               Matara,Sri Lanka
              </p>
            </div>
          </div>

          {/* Status Message */}
          {submitStatus.type && (
            <div 
              className={`p-4 rounded-lg text-center animate-fade-in ${
                submitStatus.type === 'success' 
                  ? 'bg-green-900/50 border border-green-800 text-green-200' 
                  : 'bg-red-900/50 border border-red-800 text-red-200'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          {/* Contact Form */}
          <div className="mt-10">
            <h2 className="text-white font-semibold text-xl mb-6 text-center animate-fade-in">
              Send Us a Message
            </h2>
            
            <form 
              onSubmit={handleSubmit}
              className="space-y-6 animate-fade-in-up"
            >
              <div className="form-item">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-white placeholder-gray-500 transition-all"
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-item">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-white placeholder-gray-500 transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-item">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-white placeholder-gray-500 transition-all"
                  placeholder="Your message..."
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="form-item">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-10 font-medium text-base text-gray-400 text-center animate-fade-in">
            Want to know more about us?{' '}
            <Link href="/about" className="text-red-400 hover:text-red-300 underline transition-colors">
              Learn about Reluxe
            </Link>
          </p>
        </div>
      </div>

      {/* Add these CSS animations to your global CSS file */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleXIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-scale-x {
          animation: scaleXIn 0.6s ease-out forwards;
        }
        .animate-card-in {
          animation: cardIn 0.6s ease-out forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}