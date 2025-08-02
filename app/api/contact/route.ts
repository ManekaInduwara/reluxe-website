import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  try {
    // Configure your email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@reluxe.store',
    pass: 'Reluxe&2025',
      },
    })

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || 'contact@reluxe.store',
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}