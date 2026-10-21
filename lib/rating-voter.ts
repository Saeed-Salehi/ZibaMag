import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

const COOKIE = 'ziba_vote'
const YEAR = 60 * 60 * 24 * 365

function secret() {
  return process.env.RATING_SECRET || 'zibamag-rating-v1'
}

export function signVoter(voterId: string) {
  return crypto.createHmac('sha256', secret()).update(voterId).digest('hex')
}

function validVoter(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{32}$/.test(value)
}

export function readVoter(req: NextApiRequest) {
  const existing = req.cookies?.[COOKIE]
  return validVoter(existing) ? existing : null
}

export function readOrCreateVoter(req: NextApiRequest, res: NextApiResponse) {
  const existing = readVoter(req)
  if (existing) return existing

  const id = crypto.randomBytes(16).toString('hex')
  const parts = [
    `${COOKIE}=${id}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${YEAR}`,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
  return id
}
