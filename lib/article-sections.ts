const HERO_SIZE = 4
const SECTION_SIZE = 5

function getSectionArticles(
  articles: TArticle[],
  offset: number,
  count: number
): TArticle[] {
  const total = articles.length
  const size = Math.min(count, total)

  return Array.from({ length: size }, (_, index) => {
    return articles[(offset + index) % total]
  })
}

export type ArticlePageSections = {
  hero: TArticle[]
  recent: TArticle[]
  featured: TArticle[]
  popular: TArticle[]
  more: TArticle[]
}

export function getArticlePageSections(
  articles: TArticle[]
): ArticlePageSections {
  const total = articles.length

  if (total === 0) {
    return {
      hero: [],
      recent: [],
      featured: [],
      popular: [],
      more: [],
    }
  }

  const heroCount = Math.min(HERO_SIZE, total)
  const sectionCount = Math.min(SECTION_SIZE, total)

  const hero = articles.slice(0, heroCount)

  // Offsets spread sections across the catalog; wrap when there are few articles.
  const recentOffset = Math.min(heroCount, total - 1)
  const featuredOffset = 0
  const popularOffset = Math.min(Math.floor(total / 3), total - 1)
  const moreOffset = Math.min(heroCount + sectionCount, total - 1)

  return {
    hero,
    recent: getSectionArticles(articles, recentOffset, sectionCount),
    featured: getSectionArticles(articles, featuredOffset, sectionCount),
    popular: getSectionArticles(articles, popularOffset, sectionCount),
    more: getSectionArticles(articles, moreOffset, sectionCount),
  }
}
