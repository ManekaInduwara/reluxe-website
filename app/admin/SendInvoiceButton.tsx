'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Loader2 } from 'lucide-react'

export function SendInvoiceButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSendInvoice = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) throw new Error('Failed to send invoice')

      setSent(true)
    } catch (err) {
      console.error('Send invoice failed:', err)
      alert('Failed to send invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSendInvoice}
      disabled={loading || sent}
      className={sent ? 'bg-green-600 hover:bg-green-700' : ''}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Sending...
        </>
      ) : sent ? (
        <>
          <Mail className="h-4 w-4 mr-2" />
          Sent
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-2" />
          Send Invoice
        </>
      )}
    </Button>
  )
}
