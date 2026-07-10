const DEFAULT_API_URL = 'http://localhost:1337'

export function getApiBaseUrl() {
  return process.env.API_URL || DEFAULT_API_URL
}

export function getStrapiURL(path: string) {
  return `${getApiBaseUrl()}${path}`
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

// Helper to make GET requests to Strapi
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

export const getMediaURL = (url?: string) => {
  if (!url) return ' '

  if (url.startsWith('//')) return url

  // Strapi often stores absolute localhost URLs in the CMS; always rewrite uploads.
  if (isStrapiMediaUrl(url)) {
    const path = url.startsWith('http') ? new URL(url).pathname : url
    return getStrapiURL(path)
  }

  if (url.startsWith('http')) return url

  return getStrapiURL(url)
}

export async function getNavigation(): Promise<TNavigation> {
  const [categories, pages] = await Promise.all([
    fetchAPI('/categories'),
    fetchAPI('/pages'),
  ])

  return { categories, pages }
}
