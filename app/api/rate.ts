import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(req: Request) {
  const { productId, rating } = await req.json()

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await client.patch(productId)
      .append('ratings', [rating])
      .commit()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
