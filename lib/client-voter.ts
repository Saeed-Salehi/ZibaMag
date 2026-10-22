const ID_KEY = 'ziba_vote'
const SIGN_KEY = 'ziba_vote_sign'

export type ClientVoter = {
  voterId: string
  voterSign: string
}

export function readClientVoter(): ClientVoter | null {
  if (typeof window === 'undefined') return null
  try {
    const voterId = window.localStorage.getItem(ID_KEY)
    const voterSign = window.localStorage.getItem(SIGN_KEY)
    if (
      voterId &&
      voterSign &&
      /^[a-f0-9]{32}$/.test(voterId) &&
      /^[a-f0-9]{64}$/.test(voterSign)
    ) {
      return { voterId, voterSign }
    }
  } catch {
    // private mode / blocked storage
  }
  return null
}

export function writeClientVoter(voter: ClientVoter) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ID_KEY, voter.voterId)
    window.localStorage.setItem(SIGN_KEY, voter.voterSign)
  } catch {
    // ignore
  }
}

export function rememberVoterFromPayload(data: unknown) {
  if (!data || typeof data !== 'object') return
  const row = data as Record<string, unknown>
  const voterId = row.voterId
  const voterSign = row.voterSign
  if (typeof voterId === 'string' && typeof voterSign === 'string') {
    writeClientVoter({ voterId, voterSign })
  }
}
