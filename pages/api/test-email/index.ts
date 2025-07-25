// /app/api/admin/test-email/route.ts

import { NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/sendTestEmail'

export async function GET() {
  const result = await sendTestEmail()
  return NextResponse.json(result)
}
