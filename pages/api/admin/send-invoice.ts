import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'

// TypeScript interfaces for type safety
interface OrderItem {
  title: string
  color?: string
  size?: string
  quantity: number
  price: number
  product?: {
    mainImage?: string
    slug?: string
  }
}

interface Customer {
  email: string
  name?: string
}

interface Order {
  _id: string
  _createdAt: string
  customer: Customer
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod?: string
  status?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' })
  }

  try {
    // Verify environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured')
    }

    const order = await client.fetch<Order>(
      groq`*[_type == "order" && _id == $id][0]{
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
      }`,
      { id: orderId }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (!order.customer?.email) {
      return res.status(400).json({ error: 'Customer email not found in order' })
    }

    await sendInvoiceEmail(order.customer.email, order)

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('❌ Error sending invoice:', error)
    return res.status(500).json({ 
      error: 'Failed to send invoice', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    })
  }
}

async function sendInvoiceEmail(to: string, order: Order) {
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

  const statusColors: Record<string, string> = {
    'processing': '#f59e0b',
    'shipped': '#3b82f6',
    'delivered': '#10b981',
    'cancelled': '#ef4444',
    'completed': '#10b981',
    'pending': '#f59e0b'
  }

  const statusColor = order.status ? statusColors[order.status.toLowerCase()] || '#6b7280' : '#6b7280'
  const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'

  const itemsTable = order.items.map((item, index) => {
    const colorValue = getColorValue(item.color || '')
    const colorDisplay = item.color ? `
      <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
        <div style="
          display: inline-block;
          width: 16px;
          height: 16px;
          background-color: ${colorValue};
          border-radius: 50%;
          border: 1px solid #ddd;
        "></div>
        <span style="font-size: 12px;">${item.color}</span>
      </div>
    ` : '-'

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
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
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">
          ${colorDisplay}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.size || '-'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">LKR ${item.price.toFixed(2)}</td>
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
        body { 
          font-family: 'Poppins', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
          background-color: #f9fafb;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 8px; 
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #111827;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .content {
          padding: 24px;
        }
        .order-info {
          margin-bottom: 24px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
          background-color: ${statusColor};
          margin-left: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f3f4f6;
          text-align: left;
          padding: 12px;
          font-weight: 500;
        }
        .totals {
          margin-top: 24px;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total-row.final {
          font-weight: 600;
          font-size: 18px;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order Receipt</h1>
          <p>Thank you for shopping with us!</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> <span class="status-badge">${statusText}</span></p>
          </div>
          
          <h2>Order Details</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Product</th>
                <th style="width: 15%;">Color</th>
                <th style="width: 10%;">Size</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>LKR ${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>LKR ${order.shipping.toFixed(2)}</span>
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>LKR ${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} Reluxe Clothing. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"Reluxe Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order #${order._id.slice(-6).toUpperCase()} - ${statusText}`,
    html,
  }

  await transporter.sendMail(mailOptions)
}

// Helper functions for color handling
function getColorValue(color: string): string {
  if (!color) return '#cccccc'
  
  // Check if it's already a valid hex
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return formatColor(color)
  }
  
  // Check if it's rgb/rgba
  if (/^rgba?\((\s*\d+\s*,\s*){2}\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(color)) {
    return color
  }
  
  // Try to convert color name to hex
  return colorNameToHex(color) || '#cccccc'
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

function colorNameToHex(color: string): string {
  const colors: Record<string, string> = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'black': '#000000',
    'white': '#ffffff',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#1aead9590ec1',
    'gray': '#808080',
    'grey': '#808080',
    'brown': '#a52a2a',
    'navy': '#000080',
    'teal': '#008080',
    'silver': '#c0c0c0',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00ff00',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
    'gold': '#ffd700',
    'indigo': '#4b0082',
    'violet': '#ee82ee',
    'coral': '#ff7f50',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'beige': '#f5f5dc',
    'lavender': '#e6e6fa',
    'turquoise': '#40e0d0',
    'salmon': '#fa8072',
    'tan': '#d2b48c',
    'plum': '#dda0dd',
    'skyblue': '#87ceeb',
    'khaki': '#f0e68c',
    'crimson': '#dc143c',
    // Add more colors as needed
  }
  
  // Clean the color string (remove special characters and convert to lowercase)
  const cleanColor = color.replace(/[^a-zA-Z]/g, '').toLowerCase()
  return colors[cleanColor] || '#cccccc'
}
