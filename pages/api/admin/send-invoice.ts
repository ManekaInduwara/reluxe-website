import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' })
  }

  try {
    const order = await client.fetch(groq`*[_type == "order" && _id == $id][0]{
      _id,
      _createdAt,
      customer,
      items[]{
        title,
        color,
        size,
        quantity,
        price,
        product->{
          "mainImage": images[0].asset->url,
          "slug": slug.current
        }
      },
      subtotal,
      shipping,
      total,
      paymentMethod,
      status
    }`, { id: orderId })

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

  const orderDate = new Date(order._createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Status colors with fallback to named colors
  const statusColors: Record<string, string> = {
    'processing': 'orange',
    'shipped': 'blue',
    'delivered': 'green',
    'cancelled': 'red',
    'completed': 'green',
    'pending': 'orange'
  }

  const statusColor = statusColors[order.status?.toLowerCase()] || 'gray'

  const itemsTable = order.items.map((item: any, index: number) => {
    // Convert color to named color if hex isn't working
    const colorValue = item.color 
      ? isValidColor(item.color) 
        ? formatColor(item.color)
        : colorNameToHex(item.color) || '#cccccc'
      : null

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.product?.mainImage ? `
              <img src="${item.product.mainImage}" alt="${item.title}" 
                style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;" />
            ` : ''}
            <div>
              <div style="font-weight: 600;">${item.title}</div>
              ${item.product?.slug ? `
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products/${item.product.slug}" 
                  style="color: #3b82f6; font-size: 12px; text-decoration: none;">
                  View product
                </a>
              ` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <div style="
              display: inline-block;
              width: 16px;
              height: 16px;
              background-color: ${item.color};
              border-radius: 50%;
              border: 1px solid #ddd;
            ">${item.color}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.size || '-'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">LKR ${item.price.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Receipt - Reluxe Clothing</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          background-color: ${statusColor};
        }
        /* ... (other styles remain the same) ... */
      </style>
    </head>
    <body>
      <!-- ... (rest of your HTML template remains the same) ... -->
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Reluxe Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order ${order.status ? order.status.toUpperCase() : ''} - #${order._id.slice(-6).toUpperCase()}`,
    html,
  })
}

// Helper functions for color handling
function isValidColor(color: string): boolean {
  return /^(#([0-9A-F]{3}){1,2}|(rgb|hsl)a?\(\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*(,\s*[01]?\s*)?\))$/i.test(color)
}

function formatColor(color: string): string {
  if (color.startsWith('#')) {
    // Convert 3-digit hex to 6-digit
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    }
    return color.toLowerCase()
  }
  return color
}

function colorNameToHex(color: string): string | null {
  const colors: Record<string, string> = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'black': '#000000',
    'white': '#ffffff',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'gray': '#808080'
  }
  return colors[color.toLowerCase()] || null
}