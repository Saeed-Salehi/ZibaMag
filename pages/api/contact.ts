import { NextApiRequest, NextApiResponse } from 'next'
import { getApiBaseUrl } from '@lib/api'

export default async function contact(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { fullName, mobile, message } = req.body || {}

  if (
    typeof fullName !== 'string' ||
    typeof mobile !== 'string' ||
    typeof message !== 'string' ||
    !fullName.trim() ||
    !mobile.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({ message: 'Invalid payload' })
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        message: message.trim(),
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || data?.statusCode >= 400) {
      return res.status(response.status || 502).json({
        message: data?.message || 'Failed to submit contact message',
      })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(502).json({
      message: error instanceof Error ? error.message : 'Contact proxy failed',
    })
  }
}
