import { client } from '@/sanity/lib/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { maintenance, message, endTime } = req.body

    // Verify required fields
    if (typeof maintenance !== 'boolean') {
      return res.status(400).json({ message: 'Maintenance mode status is required' })
    }

    // Get or create siteSettings document
    const existingSettings = await client.fetch(
      `*[_type == "siteSettings"][0]{_id}`
    )

    let result;
    if (existingSettings) {
      result = await client
        .patch(existingSettings._id)
        .set({
          maintenanceMode: maintenance,
          maintenanceMessage: message,
          estimatedEndTime: endTime
        })
        .commit();
    } else {
      result = await client.create({
        _type: 'siteSettings',
        maintenanceMode: maintenance,
        maintenanceMessage: message,
        estimatedEndTime: endTime
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({
      message: 'Failed to update maintenance mode',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}