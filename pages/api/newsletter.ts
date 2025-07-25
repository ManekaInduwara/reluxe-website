import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '@/sanity/lib/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    await client.create({
      _type: 'newsletterEmail',
      email,
      createdAt: new Date().toISOString(),
    })
    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to save email' })
  }
}
