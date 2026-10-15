import { NextApiRequest, NextApiResponse } from 'next'
import { getApiBaseUrl } from '@lib/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const response = await fetch(`${getApiBaseUrl()}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body || {}),
  })
  const data = await response.json().catch(() => ({}))
  return res.status(response.status).json(data)
}
