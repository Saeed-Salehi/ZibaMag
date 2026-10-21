export const TAG_PAGE_MIN_ARTICLES = 3
export const RELATED_LIMIT = 4
export const SECTION_SIZE = 5
export const HERO_SIDE_SIZE = 3

export function articleKey(article: TArticle): string {
  return String(article.id ?? article.slug)
}

export function publishedAtMs(article: TArticle): number {
  const value = new Date(article.published_at as string).getTime()
  return Number.isFinite(value) ? value : 0
}

export function averageRating(article: {
  ratingSum?: number
  ratingCount?: number
  average?: number
}): number {
  if (typeof article.average === 'number' && Number.isFinite(article.average)) {
    return Math.min(5, Math.max(0, article.average))
  }
  const count = Number(article.ratingCount) || 0
  if (count <= 0) return 0
  const sum = Number(article.ratingSum) || 0
  const average = sum / count
  if (!Number.isFinite(average) || average <= 0) return 0
  return Math.min(5, average)
}

export function sortByNewest(articles: TArticle[]): TArticle[] {
  return [...articles].sort((a, b) => publishedAtMs(b) - publishedAtMs(a))
}

export function sortByViews(articles: TArticle[]): TArticle[] {
  return [...articles].sort((a, b) => {
    const byViews = (b.views || 0) - (a.views || 0)
    if (byViews !== 0) return byViews
    return publishedAtMs(b) - publishedAtMs(a)
  })
}

export function sortByRating(articles: TArticle[]): TArticle[] {
  return [...articles].sort((a, b) => {
    const byRating = averageRating(b) - averageRating(a)
    if (byRating !== 0) return byRating
    const byCount = (b.ratingCount || 0) - (a.ratingCount || 0)
    if (byCount !== 0) return byCount
    return publishedAtMs(b) - publishedAtMs(a)
  })
}

export function takeUnused(
  candidates: TArticle[],
  count: number,
  used: Set<string>
): TArticle[] {
  if (count <= 0) return []
  const picked: TArticle[] = []
  for (const article of candidates) {
    const key = articleKey(article)
    if (used.has(key)) continue
    used.add(key)
    picked.push(article)
    if (picked.length >= count) break
  }
  return picked
}

export function hasCover(article: TArticle): boolean {
  return Boolean(article.cover?.url || article.cover?.formats)
}

export function preferCoverLead(articles: TArticle[]): TArticle[] {
  const coverIndex = articles.findIndex(hasCover)
  if (coverIndex <= 0) return articles
  const next = [...articles]
  const [withCover] = next.splice(coverIndex, 1)
  next.unshift(withCover)
  return next
}

export function getRelatedArticles(
  article: TArticle,
  pool: TArticle[],
  limit = RELATED_LIMIT
): TArticle[] {
  const self = articleKey(article)
  const tagSlugs = new Set((article.tags || []).map((t) => t.slug))
  const scored = pool
    .filter((item) => articleKey(item) !== self)
    .map((item) => {
      let score = 0
      if (item.category?.id === article.category?.id) score += 5
      for (const tag of item.tags || []) {
        if (tagSlugs.has(tag.slug)) score += 3
      }
      if (item.author?.id === article.author?.id) score += 1
      score += Math.min(2, (item.views || 0) / 500)
      score += averageRating(item) * 0.4
      return { item, score }
    })
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || publishedAtMs(b.item) - publishedAtMs(a.item)
    )

  const related = scored.slice(0, limit).map((row) => row.item)
  if (related.length >= limit) return related

  const used = new Set(related.map(articleKey).concat(self))
  return related.concat(
    takeUnused(sortByNewest(pool), limit - related.length, used)
  )
}
