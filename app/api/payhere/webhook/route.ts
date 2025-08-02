import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = body;

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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
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

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (e) {
    console.error('PayHere Webhook Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
