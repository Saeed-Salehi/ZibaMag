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

  const id = req.query.id
  const response = await fetch(`${getApiBaseUrl()}/articles/${id}/view`, {
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))
  return res.status(response.status).json(data)
}
