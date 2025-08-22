import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/sanity/lib/client'
import PDFDocument from 'pdfkit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).send('Invalid order ID')
  }

  const order = await client.fetch(`*[_type == "order" && _id == $id][0]`, { id })

  if (!order) {
    return res.status(404).send('Order not found')
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=order-${id}.pdf`)

  const doc = new PDFDocument({ margin: 40 })
  doc.pipe(res)

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`
  const address = `${order.customer.address}, ${order.customer.city}`
  const orderId = order._id.slice(-6).toUpperCase()

  // Title
  doc
    .fontSize(20)
    .fillColor('#333')
    .text(`Order #${orderId} Report`, { align: 'center' })
    .moveDown(1)

  doc
    .fontSize(12)
    .fillColor('#000')
    .text(`Status: ${order.status.toUpperCase()}`)
    .text(`Customer: ${customerName}`)
    .text(`Phone: ${order.customer.phone}`)
    .text(`Email: ${order.customer.email}`)
    .text(`Address: ${address}`)
      .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`) 
    .text(`Total: LKR ${order.total.toFixed(2)}`)

  doc.moveDown(1)
  doc.fontSize(14).text('Products:', { underline: true })

  order.items.forEach((item: any, index: number) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(`${index + 1}. ${item.title}`)

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`Quantity: ${item.quantity}`)
      .text(`Price: LKR ${item.price.toFixed(2)}`)
      .text(`Color: ${item.colorName || 'N/A'}`)
      .text(`Size: ${item.size || 'N/A'}`)
      .moveDown(0.5)
  })

  doc.end()
}
