import crypto from 'crypto'

interface PayHereParams {
  merchant_id: string;
  order_id: string;
  amount: string | number;
  currency: string;
}

export const generateSignature = (params: PayHereParams) => {
  try {
    const merchantSecret = process.env.PAYHERE_SECRET
    if (!merchantSecret) {
      throw new Error('PAYHERE_SECRET environment variable is not set')
    }
    const formattedAmount = parseFloat(String(params.amount)).toFixed(2)
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

export const generatePayherePayment = async (order: any, amount: number) => {
  try {
    const merchantId = process.env.PAYHERE_MERCHANT_ID
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    if (!merchantId) {
      throw new Error('PAYHERE_MERCHANT_ID environment variable is not set')
    }
    if (!nextAuthUrl) {
      throw new Error('NEXTAUTH_URL environment variable is not set')
    }
    
    const orderId = order._id.toString()
    const city = order?.billingAddress?.city || 'Colombo'
    const address = order?.billingAddress?.address || 'No Address Provided'
    const formattedAmount = parseFloat(String(amount)).toFixed(2)

    const params = {
      merchant_id: merchantId.trim(),
      return_url: `${nextAuthUrl}/api/site/order/payment/payhere/validate`.trim(),
      cancel_url: `${nextAuthUrl}/order-failed?orderId=${orderId}`.trim(),
      notify_url: `${nextAuthUrl}/api/site/payment/payhere/notify`.trim(),
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

    const hash = generateSignature(params)
    return {
      ...params,
      hash
    }

  } catch (error) {
    console.error('Error in generatePayherePayment:', error)
    throw error
  }
}