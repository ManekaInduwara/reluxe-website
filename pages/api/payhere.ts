import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { amount, orderId, customer } = req.body

  const merchantId = process.env.PAYHERE_MERCHANT_ID
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation/${orderId}`
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/order-cancelled/${orderId}`
  const notifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payhere-notify`

  const formData = new URLSearchParams({
    merchant_id: merchantId!,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    order_id: orderId,
    items: 'Order Payment',
    amount: amount.toFixed(2),
    currency: 'LKR',
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    country: 'Sri Lanka',
  })

  const paymentUrl = `https://sandbox.payhere.lk/pay/checkout?${formData.toString()}`

  return res.status(200).json({ paymentUrl })
}
