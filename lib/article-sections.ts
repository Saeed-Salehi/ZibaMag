import {
  HERO_SIDE_SIZE,
  SECTION_SIZE,
  articleKey,
  averageRating,
  preferCoverLead,
  sortByNewest,
  sortByRating,
  sortByViews,
  takeUnused,
} from './articles'

export type ArticlePageSections = {
  hero: TArticle[]
  recent: TArticle[]
  featured: TArticle[]
  popular: TArticle[]
  more: TArticle[]
}

type FeedOptions = {
  heroArticle?: TArticle | null
  feedArticles?: TArticle[] | null
}

function resolveArticle(
  ref: TArticle | number | null | undefined,
  byId: Map<number, TArticle>
): TArticle | undefined {
  if (!ref) return undefined
  if (typeof ref === 'number') return byId.get(ref)
  return byId.get(ref.id) || ref
}

export function getArticlePageSections(
  articles: TArticle[],
  options: FeedOptions = {}
): ArticlePageSections {
  if (articles.length === 0) {
    return { hero: [], recent: [], featured: [], popular: [], more: [] }
  }

  const newest = sortByNewest(articles)
  const byId = new Map(newest.map((a) => [a.id, a]))
  const used = new Set<string>()

  const curatedHero = resolveArticle(options.heroArticle, byId)
  const curatedFeed = (options.feedArticles || [])
    .map((item) => resolveArticle(item, byId))
    .filter(Boolean) as TArticle[]

  let hero: TArticle[] = []
  if (curatedHero) {
    used.add(articleKey(curatedHero))
    const side = takeUnused(
      curatedFeed.length ? curatedFeed : newest,
      HERO_SIDE_SIZE,
      used
    )
    hero = preferCoverLead([curatedHero, ...side])
  } else if (curatedFeed.length) {
    hero = preferCoverLead(takeUnused(curatedFeed, HERO_SIDE_SIZE + 1, used))
  } else {
    hero = preferCoverLead(takeUnused(newest, HERO_SIDE_SIZE + 1, used))
  }

  const recent = takeUnused(newest, SECTION_SIZE, used)

  const starred = newest.filter((a) => a.featured)
  const rated = sortByRating(
    newest.filter((a) => (a.ratingCount || 0) > 0 && averageRating(a) >= 3.5)
  )
  const featuredPool = starred.length ? starred : rated.length ? rated : newest
  let featured = takeUnused(featuredPool, SECTION_SIZE, used)
  if (featured.length < Math.min(3, newest.length)) {
    featured = featured.concat(
      takeUnused(sortByRating(newest), SECTION_SIZE - featured.length, used)
    )
  }
  if (featured.length === 0) {
    featured = takeUnused(newest, Math.min(SECTION_SIZE, newest.length), used)
  }

  const viewed = sortByViews(newest.filter((a) => (a.views || 0) > 0))
  const popularPool = viewed.length ? viewed : sortByViews(newest)
  let popular = takeUnused(popularPool, SECTION_SIZE, used)
  if (popular.length < Math.min(3, newest.length)) {
    popular = popular.concat(
      takeUnused(sortByViews(newest), SECTION_SIZE - popular.length, used)
    )
  }
  if (popular.length === 0) {
    popular = takeUnused(newest, Math.min(SECTION_SIZE, newest.length), used)
  }

  // Keep columns visually balanced
  const pairSize = Math.min(
    SECTION_SIZE,
    Math.max(featured.length, popular.length),
    Math.max(featured.length + popular.length, 1)
  )
  if (featured.length < pairSize) {
    featured = featured.concat(
      takeUnused(newest, pairSize - featured.length, used)
    )
  }
  if (popular.length < pairSize) {
    popular = popular.concat(
      takeUnused(sortByViews(newest), pairSize - popular.length, used)
    )
  }

  const more = takeUnused(newest, SECTION_SIZE, used)

  return { hero, recent, featured, popular, more }
}
