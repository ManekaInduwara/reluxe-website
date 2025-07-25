import crypto from 'crypto';

const generateSignature = (params: any) => {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const formattedAmount = parseFloat(params.amount).toFixed(2);

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret!)
    .digest('hex')
    .toUpperCase();

  const dataToSign = `${params.merchant_id}${params.order_id}${formattedAmount}${params.currency}${hashedSecret}`;

  return crypto.createHash('md5').update(dataToSign).digest('hex').toUpperCase();
};

const generatePayherePayment = async (order: any, amount: number) => {
  const formattedAmount = parseFloat(amount.toString()).toFixed(2);

  const params: any = {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-success?orderId=${order._id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-failed?orderId=${order._id}`,
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payhere/notify`,
    order_id: order._id,
    items: 'Order Payment',
    currency: 'LKR',
    amount: formattedAmount,
    first_name: order.customer?.firstName || 'Customer',
    last_name: order.customer?.lastName || 'Unknown',
    email: order.customer?.email || '',
    phone: order.customer?.phone || '',
    address: order.customer?.address || 'N/A',
    city: order.customer?.city || 'Colombo',
    country: 'Sri Lanka',
    custom_1: '',
    custom_2: '',
  };

  params.hash = generateSignature(params);

  return params;
};

export default generatePayherePayment;
