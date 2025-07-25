'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: PayHerePayment) => void
      onCompleted?: (orderId: string) => void
      onDismissed?: () => void
      onError?: (error: string) => void
    }
  }
}

interface PayHerePayment {
  sandbox: boolean
  merchant_id: string
  merchant_secret?: string
  return_url: string
  cancel_url: string
  notify_url: string
  order_id: string
  items: string
  amount: string
  currency: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  delivery_address?: string
  delivery_city?: string
  delivery_country?: string
  custom_1?: string
  custom_2?: string
}

interface PayHereButtonProps {
  amount: number
  items: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
  }
  onSuccess?: (orderId: string) => void
  onError?: (error: string) => void
}

export function PayHereButton({
  amount,
  items,
  customer,
  onSuccess,
  onError
}: PayHereButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://www.payhere.lk/lib/payhere.js"]')) {
      setIsScriptLoaded(true)
      return
    }

    // Load PayHere script dynamically
    const script = document.createElement('script')
    script.src = 'https://www.payhere.lk/lib/payhere.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      console.error('Failed to load PayHere script')
      setIsLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initiatePayment = () => {
    if (!isScriptLoaded) {
      toast.error('Payment system is still loading')
      return
    }

    setIsLoading(true)

    // Configure payment details
    const payment: PayHerePayment = {
      sandbox: process.env.NEXT_PUBLIC_PAYHERE_MODE !== 'production',
      merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '1231068',
      merchant_secret: process.env.PAYHERE_SECRET,
      return_url: `${window.location.origin}/order/success`,
      cancel_url: `${window.location.origin}/checkout`,
      notify_url: `${window.location.origin}/api/payhere/webhook`,
      order_id: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      items: items,
      amount: amount.toFixed(2),
      currency: 'LKR',
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: 'Sri Lanka',
      delivery_address: customer.address,
      delivery_city: customer.city,
      delivery_country: 'Sri Lanka',
      custom_1: 'Additional info if needed'
    }

    // Set up callbacks
    window.payhere = window.payhere || {}
    
    window.payhere.onCompleted = function(orderId: string) {
      setIsLoading(false)
      toast.success('Payment completed successfully!')
      if (onSuccess) onSuccess(orderId)
    }

    window.payhere.onDismissed = function() {
      setIsLoading(false)
      toast.info('Payment was dismissed')
    }

    window.payhere.onError = function(error: string) {
      setIsLoading(false)
      toast.error(`Payment error: ${error}`)
      if (onError) onError(error)
    }

    // Start payment
    try {
      window.payhere.startPayment(payment)
    } catch (err) {
      setIsLoading(false)
      toast.error('Failed to initialize payment')
      console.error('PayHere error:', err)
    }
  }

  return (
    <Button
      onClick={initiatePayment}
      disabled={isLoading}
      className="w-full bg-[#2a52be] hover:bg-[#1a3a9e]"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Pay LKR {amount.toFixed(2)} with PayHere</>
      )}
    </Button>
  )
}