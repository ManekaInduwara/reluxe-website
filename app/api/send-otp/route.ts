import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const emailSent = await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    html: `
      <div>
        <h2>Your OTP Code</h2>
        <p>Use the following code to verify your identity:</p>
        <h1 style="font-size: 2rem; letter-spacing: 0.5rem; margin: 1rem 0;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  })

  if (!emailSent) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }

  return NextResponse.json({ success: true, otp })
}