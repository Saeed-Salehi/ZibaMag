import { NextApiRequest, NextApiResponse } from 'next'
import { getApiBaseUrl } from '@lib/api'
import {
  readOrCreateVoter,
  resolveVoter,
  signVoter,
  voterPayload,
} from '@lib/rating-voter'

function voterHeaders(voterId: string) {
  return {
    'x-voter-id': voterId,
    'x-voter-sign': signVoter(voterId),
  }
}

function withVoter<T extends Record<string, unknown>>(
  data: T,
  voterId: string
) {
  return { ...data, ...voterPayload(voterId) }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id
  if (Array.isArray(id) || !/^\d+$/.test(String(id || ''))) {
    return res.status(400).json({ message: 'Invalid article id' })
  }

  if (req.method === 'GET') {
    // Establish a stable voter id early (cookie + returned credentials).
    const voterId = resolveVoter(req, res)
    const response = await fetch(`${getApiBaseUrl()}/articles/${id}/rate`, {
      headers: voterHeaders(voterId),
    })
    const data = await response.json().catch(() => ({}))
    return res.status(response.status).json(withVoter(data, voterId))
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end()
  }

  const rating = Number((req.body || {}).rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: 'rating must be an integer from 1 to 5' })
  }

  const voterId = readOrCreateVoter(req, res)
  const response = await fetch(`${getApiBaseUrl()}/articles/${id}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...voterHeaders(voterId),
    },
    body: JSON.stringify({ rating }),
  })
  const data = await response.json().catch(() => ({}))
  return res.status(response.status).json(withVoter(data, voterId))
}
