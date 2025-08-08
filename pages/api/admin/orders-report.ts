import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/sanity/lib/client'
import PDFDocument from 'pdfkit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const orders = await client.fetch(`*[_type == "order"] | order(_createdAt desc)`)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=order-report.pdf')

  const doc = new PDFDocument({ margin: 40 })
  doc.pipe(res)

  // Title & Header
  doc
    .fontSize(20)
    .fillColor('#333')
    .text('Reluxe Clothing – Order Report', { align: 'center' })
    .moveDown(0.5)

  doc
    .fontSize(12)
    .fillColor('#555')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
    .moveDown(1)

  // Loop Through Orders
  orders.forEach((order: any, index: number) => {
    if (index > 0) {
      doc.moveDown(1)
      doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor('#ccc').stroke()
      doc.moveDown(0.5)
    }

    const customerName = `${order.customer.firstName} ${order.customer.lastName}`
    const total = order.total.toFixed(2)
    const status = order.status
    const orderId = order._id.slice(-6).toUpperCase()
    const address = `${order.customer.address}, ${order.customer.city}`
    const phone = order.customer.phone
    const email = order.customer.email
    const paymentMethod = order.paymentMethod?.toUpperCase() || 'N/A'

    // Basic Order Summary
    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Order #${orderId}`, { continued: true })
      .fontSize(10)
      .fillColor('#555')
      .text(`   (${status.toUpperCase()})`)

    doc.moveDown(0.3)

    doc
      .fontSize(11)
      .fillColor('#333')
      .text(`Customer: ${customerName}`)
      .text(`Total: LKR ${total}`)
      .text(`Phone: ${phone}`)
      .text(`Email: ${email}`)
      .text(`Address: ${address}`)
      .text(`Payment Method: ${paymentMethod}`)

    doc.moveDown(0.5)

    // Items
    doc
      .fontSize(10)
      .fillColor('#000')
      .text(`Items:`)

    order.items.forEach((item: any) => {
      const itemLine = `- ${item.title} (${item.quantity} × LKR ${item.price.toFixed(2)})`
      const color = item.color ? `Color: ${item.colorName}` : ''
      const size = item.size ? `Size: ${item.size}` : ''
      const details = [color, size].filter(Boolean).join(' | ')

      doc.text(itemLine, { indent: 20 })
      if (details) {
        doc
          .fontSize(9)
          .fillColor('#555')
          .text(`(${details})`, { indent: 40 })
          .moveDown(0.2)
      }
    })

    // Optional: Page break if needed
    if (doc.y > 700) {
      doc.addPage()
    }
  })

  doc.moveDown(2)

  doc
    .fontSize(12)
    .fillColor('#777')
    .text('Thank you for using Reluxe Clothing Admin Dashboard.', { align: 'center' })

  doc.end()
}
