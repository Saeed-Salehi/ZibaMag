const DEFAULT_API_URL = 'http://localhost:1337'

/** Server-side Strapi base (on production: http://127.0.0.1:1337). */
export function getApiBaseUrl() {
  return process.env.API_URL || DEFAULT_API_URL
}

/**
 * Base URL for browser-facing media.
 * Prefer NEXT_PUBLIC_API_URL if set; otherwise NEXT_PUBLIC_SITE_URL so
 * addresses are absolute (https://zibamag.ir/uploads/...) and proxied by Next.
 */
export function getPublicApiBaseUrl() {
  const explicit = (process.env.NEXT_PUBLIC_API_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (explicit) return explicit
  return (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
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

// Helper to make GET requests to Strapi (server-side / SSG)
export async function fetchAPI(path: string) {
  const requestUrl = getStrapiURL(path)
  const response = await fetch(requestUrl)
  const data = await response.json()

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

// Contact form posts to Next.js API (proxies to Strapi on 127.0.0.1)
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

  // Strapi often stores absolute localhost URLs in the CMS; always rewrite uploads.
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
