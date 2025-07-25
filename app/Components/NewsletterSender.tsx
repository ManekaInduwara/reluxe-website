'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export function NewsletterSender() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!subject || !message) {
      toast.error('Subject and message required')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    })
    if (res.ok) {
      toast.success('Newsletter sent!')
    } else {
      toast.error('Failed to send newsletter.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow mb-8 text-black">
      <h2 className="text-xl font-bold mb-4">Send Newsletter</h2>
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mb-4"
      />
      <Textarea
        placeholder="Your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className="mb-4"
      />
      <Button onClick={handleSend} disabled={loading} className="bg-blue-600 text-white">
        {loading ? 'Sending...' : 'Send to All Subscribers'}
      </Button>
    </div>
  )
}