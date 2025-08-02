// app/api/payhere/notify/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { client } from '@/sanity/lib/client'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const notification = Object.fromEntries(formData.entries())

    // Verify the payment signature
   const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    if (!merchantSecret) {
      throw new Error('PAYHERE_MERCHANT_SECRET is not configured')
    }

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1, // This contains our order ID
      ...otherParams
    } = notification

    // Generate the expected MD5 signature
    const localMd5 = crypto
      .createHash('md5')
      .update(
        merchant_id +
          order_id +
          payment_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash('md5')
            .update(merchantSecret)
            .digest('hex')
            .toUpperCase()
      )
      .digest('hex')
      .toUpperCase()

    // Verify the signature
    if (localMd5 !== md5sig) {
      console.error('Invalid signature detected', {
        received: md5sig,
        calculated: localMd5,
        notification
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Signature verified - process the notification
    console.log('Received valid PayHere notification:', notification)

    // Update order status in Sanity based on payment status
    const statusMap: Record<string, string> = {
      '2': 'paid',         // Success
      '0': 'pending',      // Pending
      '-1': 'cancelled',   // Cancelled
      '-2': 'failed',      // Failed
      '-3': 'charged_back' // Charged back
    }

    const newStatus = statusMap[status_code.toString()] || 'pending'

    // Update the order in Sanity
    await client
      .patch(custom_1 as string) // Using our order ID from custom_1
      .set({
        paymentStatus: newStatus,
        paymentId: payment_id,
        paymentAmount: parseFloat(payhere_amount as string),
        paymentCurrency: payhere_currency,
        paymentMethod: notification.method, // e.g., "VISA", "MASTER", etc.
        paymentDate: new Date().toISOString(),
        ...(newStatus === 'paid' && { status: 'processing' }) // Only update order status if paid
      })
      .commit()

    console.log(`Updated order ${custom_1} to status ${newStatus}`)

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('Error processing PayHere notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' // Ensure this route is dynamic