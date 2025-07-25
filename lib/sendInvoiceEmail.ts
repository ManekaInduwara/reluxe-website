import { transporter } from './nodemailer';
import { generateInvoicePDF } from './generateInvoicePDF';

export async function sendInvoiceEmail(order: any) {
  const pdfBuffer = await generateInvoicePDF(order);

  await transporter.sendMail({
    from: '"Reluxe Clothing" <contact@reluxe.store>',
    to: order.customer.email,
    subject: `Your Invoice – Order #${order._id.slice(-6).toUpperCase()}`,
    text: 'Attached is your invoice. Thank you for shopping with us!',
    attachments: [
      {
        filename: `invoice-${order._id.slice(-6)}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
