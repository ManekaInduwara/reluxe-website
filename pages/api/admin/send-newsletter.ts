import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/sanity/lib/client'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, subject } = req.body
  if (!message || !subject) return res.status(400).json({ error: 'Subject and message required' })

  const emails = await client.fetch(`*[_type == "newsletterEmail"]{email}`)
  const recipients = emails.map((e: { email: string }) => e.email)

   const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    })
  
  await transporter.sendMail({
    from: `"Reluxe Clothing" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject,
    text: message,
  })

  res.status(200).json({ success: true })
}
