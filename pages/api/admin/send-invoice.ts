import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { client } from '@/sanity/lib/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' })
  }

  try {
    const order = await client.fetch(`*[_type == "order" && _id == $id][0]`, { id: orderId })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    await sendInvoiceEmail(order.customer.email, order)

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('❌ Error sending invoice:', error)
    return res.status(500).json({ error: 'Failed to send invoice', details: error.message })
  }
}

async function sendInvoiceEmail(to: string, order: any) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  })

  const orderDate = new Date(order._createdAt).toLocaleString()

  const itemsTable = order.items.map((item: any, index: number) => {
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.color || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.size || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">LKR ${item.price.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/djxqfao4r/image/upload/v1752663915/IMG_20250602_134124_460_qnswgm.webp" alt="Reluxe Clothing Logo" style="height: 60px; object-fit: contain;" />
      </div>

      <h2 style="color: #333; text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px;">🛍️ Receipt</h2>

      <p style="font-size: 14px; color: #555;">Hi ${order.customer.firstName},</p>
      <p style="font-size: 14px; color: #555;">Thank you for your purchase! Below is your order summary:</p>

      <div style="font-size: 14px; margin-bottom: 20px;">
        <strong>Order ID:</strong> ${order._id}<br />
        <strong>Date:</strong> ${orderDate}<br />
        <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}
      </div>

      <h3 style="font-size: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">👤 Customer Info</h3>
      <p style="font-size: 14px; color: #555;">
        ${order.customer.firstName} ${order.customer.lastName}<br />
        ${order.customer.email}<br />
        ${order.customer.phone || ''}<br />
        ${order.customer.address}, ${order.customer.city}
      </p>

      <h3 style="font-size: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">🛒 Items Purchased</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <thead style="background-color: #f1f1f1;">
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd;">#</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Color</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Size</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
      </table>

      <div style="font-size: 14px; color: #333;">
        <p style="border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px;">
          <strong>Subtotal:</strong> LKR ${order.subtotal.toFixed(2)}<br />
          <strong>Shipping:</strong> LKR ${order.shipping.toFixed(2)}<br />
        </p>
        <p style="font-size: 18px; color: #000; font-weight: bold; margin-top: 10px;">
          Total: LKR ${order.total.toFixed(2)}
        </p>
      </div>

      <p style="font-size: 14px; color: #555; border-top: 2px dashed #ccc; margin-top: 20px; padding-top: 10px;">
        If you have any questions, feel free to contact us.<br />
        Thank you for shopping with Reluxe Clothing!
      </p>

      <p style="font-size: 13px; color: #999; text-align: center; margin-top: 20px;">
        Reluxe Clothing © ${new Date().getFullYear()}
      </p>
    </div>
  `

  await transporter.sendMail({
    from: `"Reluxe Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Receipt - Order #${order._id.slice(-6).toUpperCase()}`,
    html,
  })
}
