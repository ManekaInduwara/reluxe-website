import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

export async function generateInvoicePDF(order: any): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40 });

  doc.fontSize(20).text(`Invoice – Order #${order._id.slice(-6).toUpperCase()}`);
  doc.moveDown();
  doc.fontSize(12).text(`Customer: ${order.customer.firstName} ${order.customer.lastName}`);
  doc.text(`Email: ${order.customer.email}`);
  doc.text(`Phone: ${order.customer.phone}`);
  doc.text(`Address: ${order.customer.address}, ${order.customer.city}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);

  doc.moveDown().fontSize(14).text('Items:');

  order.items.forEach((item: any) => {
    doc.fontSize(10).text(`- ${item.title} (${item.quantity} × LKR ${item.price.toFixed(2)})${item.size ? ` [Size: ${item.size}]` : ''}${item.color ? ` [Color: ${item.color}]` : ''}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Total: LKR ${order.total.toFixed(2)}`);
  doc.text(`Order Status: ${order.status}`);

  doc.end();

  const buffer = await getStream.buffer(doc);
  return buffer;
}
