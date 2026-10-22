import crypto from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

export const VOTER_COOKIE = 'ziba_vote'
const YEAR = 60 * 60 * 24 * 365
const VOTER_ID = /^[a-f0-9]{32}$/
const VOTER_SIGN = /^[a-f0-9]{64}$/

function secret() {
  return process.env.RATING_SECRET || 'zibamag-rating-v1'
}

export function signVoter(voterId: string) {
  return crypto.createHmac('sha256', secret()).update(voterId).digest('hex')
}

function validVoterId(value: unknown): value is string {
  return typeof value === 'string' && VOTER_ID.test(value)
}

function validSignature(value: unknown): value is string {
  return typeof value === 'string' && VOTER_SIGN.test(value)
}

export function verifyVoter(voterId: string, signature: string) {
  if (!validVoterId(voterId) || !validSignature(signature)) return false
  const expected = signVoter(voterId)
  try {
    const left = Buffer.from(expected, 'utf8')
    const right = Buffer.from(signature, 'utf8')
    return left.length === right.length && crypto.timingSafeEqual(left, right)
  } catch {
    return false
  }
}

function setVoterCookie(res: NextApiResponse, voterId: string) {
  const parts = [
    `${VOTER_COOKIE}=${voterId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${YEAR}`,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

/** Cookie, or signed headers from the browser (localStorage backup). */
export function resolveVoter(req: NextApiRequest, res: NextApiResponse) {
  const fromCookie = req.cookies?.[VOTER_COOKIE]
  if (validVoterId(fromCookie)) {
    setVoterCookie(res, fromCookie)
    return fromCookie
  }

  const headerId = String(req.headers['x-voter-id'] || '')
  const headerSign = String(req.headers['x-voter-sign'] || '')
  if (verifyVoter(headerId, headerSign)) {
    setVoterCookie(res, headerId)
    return headerId
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const bodyId = String(body.voterId || '')
  const bodySign = String(body.voterSign || '')
  if (verifyVoter(bodyId, bodySign)) {
    setVoterCookie(res, bodyId)
    return bodyId
  }

  const id = crypto.randomBytes(16).toString('hex')
  setVoterCookie(res, id)
  return id
}

export function readVoter(req: NextApiRequest) {
  const existing = req.cookies?.[VOTER_COOKIE]
  return validVoterId(existing) ? existing : null
}

export function readOrCreateVoter(req: NextApiRequest, res: NextApiResponse) {
  return resolveVoter(req, res)
}

export function voterPayload(voterId: string) {
  return {
    voterId,
    voterSign: signVoter(voterId),
  }
}
