export function getStrapiURL(path: string) {
  return `${process.env.API_URL || 'http://localhost:1337'}${path}`
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
  // Return the full url when it's external
  if (url.startsWith('http') || url.startsWith('//')) return url
  return getStrapiURL(url)
}

export async function getNavigation(): Promise<TNavigation> {
  const [categories, pages] = await Promise.all([
    fetchAPI('/categories'),
    fetchAPI('/pages'),
  ])

  return { categories, pages }
}
