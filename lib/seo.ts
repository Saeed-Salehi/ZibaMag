import { SITE_URL } from './constants'

/** Regenerate static pages at most once every 10 minutes when visited. */
export const REVALIDATE_SECONDS = 600

export function getCanonicalUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

export function getPreviewRobots(preview?: boolean) {
  return preview ? { noindex: true, nofollow: true } : {}
}

export function formatSitemapDate(
  date?: string | Date | null
): string | undefined {
  if (!date) return undefined
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString().split('T')[0]
}
