import crypto from 'crypto'

export const generateSignature = (params) => {
  try {
    const merchantSecret = process.env.PAYHERE_SECRET
    const formattedAmount = parseFloat(params.amount).toFixed(2)
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    
    const dataToSign = 
      `${params.merchant_id}` +
      `${params.order_id}` +
      `${formattedAmount}` +
      `${params.currency}` +
      `${hashedSecret}`
    
    return crypto.createHash('md5').update(dataToSign).digest('hex').toUpperCase()
  } catch (error) {
    console.error('Error generating PayHere signature:', error)
    throw error
  }
}

export const generatePayherePayment = async (order, amount) => {
  try {
    const orderId = order._id.toString()
    const city = order?.billingAddress?.city || 'Colombo'
    const address = order?.billingAddress?.address || 'No Address Provided'
    const formattedAmount = parseFloat(amount).toFixed(2)

    const params = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID.trim(),
      return_url: `${process.env.NEXTAUTH_URL}/api/site/order/payment/payhere/validate`.trim(),
      cancel_url: `${process.env.NEXTAUTH_URL}/order-failed?orderId=${orderId}`.trim(),
      notify_url: `${process.env.NEXTAUTH_URL}/api/site/payment/payhere/notify`.trim(),
      order_id: `ORD-${Date.now()}`,
      items: 'Order Payment'.trim(),
      currency: 'LKR'.trim(),
      amount: formattedAmount,
      first_name: (order?.billingAddress?.firstName || '').trim(),
      last_name: (order?.billingAddress?.lastName || '').trim(),
      email: (order?.billingAddress?.email || '').trim(),
      phone: (order?.billingAddress?.phone || '').trim(),
      address: address.trim(),
      city: city.trim(),
      country: 'Sri Lanka'.trim(),
      delivery_address: address.trim(),
      delivery_city: city.trim(),
      delivery_country: 'Sri Lanka'.trim(),
      custom_1: orderId,
      custom_2: ''
    }

    params.hash = generateSignature(params)
    return params

  } catch (error) {
    console.error('Error in generatePayherePayment:', error)
    throw error
  }
}