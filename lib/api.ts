const DEFAULT_API_URL = 'http://127.0.0.1:1337'

function normalizeApiBaseUrl(url: string) {
  return url
    .trim()
    .replace(/\/$/, '')
    .replace(/^http:\/\/localhost(?=[:/]|$)/i, 'http://127.0.0.1')
    .replace(/^https:\/\/localhost(?=[:/]|$)/i, 'https://127.0.0.1')
}

export function getApiBaseUrl() {
  return normalizeApiBaseUrl(process.env.API_URL || DEFAULT_API_URL)
}

export function getPublicApiBaseUrl() {
  const explicit = (process.env.NEXT_PUBLIC_API_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (explicit) return normalizeApiBaseUrl(explicit)
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  // next/image fetches absolute URLs from Node; localhost → ::1 and fails.
  return site ? normalizeApiBaseUrl(site) : ''
}

export function getStrapiURL(path: string) {
  return `${getApiBaseUrl()}${path}`
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl || pathOrUrl === ' ') return pathOrUrl
  if (pathOrUrl.startsWith('http') || pathOrUrl.startsWith('//')) {
    return pathOrUrl
  }
  const site = getPublicApiBaseUrl()
  return `${site}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

export function isStrapiMediaUrl(url: string) {
  if (url.startsWith('/uploads/')) return true

  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname.startsWith('/uploads/')
    } catch {
      return false
    }
  }

  return false
}

export async function fetchAPI(path: string) {
  const requestUrl = getStrapiURL(path)
  const response = await fetch(requestUrl)
  const contentType = response.headers.get('content-type') || ''
  const body = await response.text()

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Strapi returned non-JSON (${response.status}, ${
        contentType || 'unknown type'
      }) for ${requestUrl}. ` +
        'API_URL must point at the Strapi API (e.g. http://127.0.0.1:1337), not the admin UI host.'
    )
  }

  let data: any
  try {
    data = JSON.parse(body)
  } catch {
    throw new Error(
      `Strapi returned invalid JSON (${response.status}) for ${requestUrl}. ` +
        'Check that API_URL is the API base, not an HTML page.'
    )
  }

  if (!response.ok || data?.statusCode >= 400) {
    throw new Error(
      `Strapi request failed (${
        data?.statusCode ?? response.status
      }) for ${requestUrl}. ` +
        'In Strapi admin go to Settings → Users & Permissions → Public and enable "find" ' +
        'for Article, Category, Contributor, and Pages.'
    )
  }

  return data
}

export type TContactMessagePayload = {
  fullName: string
  mobile: string
  message: string
}

export async function createContactMessage(payload: TContactMessagePayload) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.statusCode >= 400) {
    throw new Error(
      data?.message || `Failed to submit contact message (${response.status})`
    )
  }

  return data
}

export const getMediaURL = (url?: string) => {
  if (!url) return ' '

  if (url.startsWith('//')) return url

  // Prefer same-origin absolute URL so next/image can fetch via the /uploads rewrite.
  // Relative /uploads fails the optimizer (not a file under public/).
  if (isStrapiMediaUrl(url)) {
    const path = url.startsWith('http') ? new URL(url).pathname : url
    return toAbsoluteUrl(path)
  }

  if (url.startsWith('http')) return url

  const path = url.startsWith('/') ? url : `/${url}`
  return toAbsoluteUrl(path)
}

export async function getNavigation(): Promise<TNavigation> {
  const [categories, pages] = await Promise.all([
    fetchAPI('/categories'),
    fetchAPI('/pages'),
  ])

  return { categories, pages }
}

export async function getGlobal(): Promise<TGlobal | null> {
  try {
    return await fetchAPI('/global')
  } catch {
    return null
  }
}

export async function recordArticleView(articleId: number) {
  const response = await fetch(`/api/articles/${articleId}/view`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to record view')
  return response.json()
}

export async function rateArticle(articleId: number, rating: number) {
  const response = await fetch(`/api/articles/${articleId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to rate article')
  }
  return data
}

export async function submitComment(payload: {
  article: number
  authorName: string
  body: string
}) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to submit comment')
  }
  return data
}
