import { SITE_URL } from '@lib/constants'
import { fetchAPI } from '@lib/api'
import { TAG_PAGE_MIN_ARTICLES } from '@lib/articles'
import { formatSitemapDate } from '@lib/seo'
import { NextPageContext } from 'next'

type Props = {
  categories: TCategory[]
  articles: TArticle[]
  pages: TPage[]
  contributors: TContributor[]
  tags: TTag[]
}

function urlEntry(loc: string, lastmod?: string, changefreq?: string) {
  return `
    <url>
      <loc>${loc}</loc>${
    lastmod ? `\n      <lastmod>${lastmod}</lastmod>` : ''
  }${changefreq ? `\n      <changefreq>${changefreq}</changefreq>` : ''}
    </url>`
}

const createSitemap = ({
  articles,
  categories,
  contributors,
  pages,
  tags,
}: Props) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntry(SITE_URL)}
  ${urlEntry(`${SITE_URL}/articles`, undefined, 'daily')}
  ${categories
    .map(({ slug, updated_at }) =>
      urlEntry(`${SITE_URL}/${slug}`, formatSitemapDate(updated_at))
    )
    .join('')}
  ${articles
    .map(({ slug, updated_at }) =>
      urlEntry(
        `${SITE_URL}/articles/${slug}`,
        formatSitemapDate(updated_at),
        'weekly'
      )
    )
    .join('')}
  ${pages
    .map(({ slug, updated_at }) =>
      urlEntry(`${SITE_URL}/pages/${slug}`, formatSitemapDate(updated_at))
    )
    .join('')}
  ${urlEntry(`${SITE_URL}/contributors`)}
  ${contributors
    .map(({ slug, updated_at }) =>
      urlEntry(
        `${SITE_URL}/contributors/${slug}`,
        formatSitemapDate(updated_at)
      )
    )
    .join('')}
  ${tags
    .map(({ slug, updated_at }: any) =>
      urlEntry(
        `${SITE_URL}/tags/${slug}`,
        formatSitemapDate(updated_at),
        'weekly'
      )
    )
    .join('')}
</urlset>`

export async function getServerSideProps({ res }: NextPageContext) {
  const [categories, articles, pages, contributors, tags]: [
    TCategory[],
    TArticle[],
    TPage[],
    TContributor[],
    TTag[]
  ] = await Promise.all([
    fetchAPI('/categories'),
    fetchAPI('/articles?_limit=-1'),
    fetchAPI('/pages'),
    fetchAPI('/contributors'),
    fetchAPI('/tags?_limit=-1').catch(() => []),
  ])

  const tagRows = await Promise.all(
    tags.map(async (tag) => {
      const tagged: TArticle[] = await fetchAPI(
        `/articles?tags.slug=${tag.slug}&_limit=-1`
      ).catch(() => [])
      return tagged.length >= TAG_PAGE_MIN_ARTICLES ? tag : null
    })
  )
  const indexableTags = tagRows.filter(Boolean) as TTag[]

  res?.setHeader('Content-Type', 'text/xml')
  res?.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  )
  res?.write(
    createSitemap({
      categories,
      articles,
      pages,
      contributors,
      tags: indexableTags,
    })
  )
  res?.end()

  return { props: {} }
}

export default () => null
