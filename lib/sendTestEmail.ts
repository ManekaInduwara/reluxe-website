import nodemailer from 'nodemailer'

export async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: 'killerfake8@gmail.com',  // Send to yourself for testing
      subject: 'Test Email from Hostinger SMTP',
      text: 'This is a plain text test email from your Next.js project.',
      html: '<p>This is a <strong>test email</strong> sent using Hostinger SMTP.</p>',
    })

    console.log('✅ Test email sent:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error: any) {
    console.error('❌ Failed to send test email:', error.message)
    return { success: false, error: error.message }
  }
}
