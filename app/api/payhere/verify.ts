import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, payment_id } = body
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    // Verify payment with PayHere API using the secret
    // This is just a conceptual example
    const verificationResponse = await verifyPaymentWithPayHere({
      order_id,
      payment_id,
      merchant_secret: merchantSecret
    })

    if (verificationResponse.status === 'success') {
      // Update your database that payment was verified
      return NextResponse.json({ verified: true }, { status: 200 })
    }
    
    return NextResponse.json({ verified: false }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function verifyPaymentWithPayHere({
    order_id,
    payment_id,
    merchant_secret
}: {
    order_id: any
    payment_id: any
    merchant_secret: string | undefined
}) {
    if (!order_id || !payment_id || !merchant_secret) {
        return { status: 'error', message: 'Missing parameters' }
    }

    // Example endpoint and payload for PayHere verification
    const endpoint = 'https://www.sandboxpayhere.lk/merchant/api/payment/verify'
    const payload = {
        order_id,
        payment_id,
        merchant_secret
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            return { status: 'error', message: 'Verification failed' }
        }

        const data = await response.json()
        // Assume PayHere returns { status: 'success' } on success
        return data
    } catch (error) {
        return { status: 'error', message: 'Network error' }
    }
}
