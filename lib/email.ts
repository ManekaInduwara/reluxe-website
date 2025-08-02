import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@reluxe.store',
    pass: 'Reluxe&2025',
  },
})

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: `"Reluxe Admin Login" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}