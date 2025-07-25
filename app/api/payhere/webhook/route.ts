import type { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/sanity/lib/client';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  try {
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const localSig = [
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase(),
    ].join('');

    const expectedSig = crypto.createHash('md5').update(localSig).digest('hex').toUpperCase();

    if (md5sig !== expectedSig) {
      console.warn('Invalid PayHere Signature');
      return res.status(400).end();
    }

    const isPaid = status_code === '2';

    await client.patch(order_id)
      .set({
        status: isPaid ? 'paid' : 'payment_failed',
        paymentId: payment_id,
        paidAmount: Number(payhere_amount),
      })
      .commit();

    console.log(`Order ${order_id} updated to ${isPaid ? 'paid' : 'payment_failed'}`);

    res.status(200).send('OK');
  } catch (e) {
    console.error('PayHere Webhook Error:', e);
    res.status(500).end();
  }
}
