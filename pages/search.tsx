import { useRouter } from 'next/router'
import { ArticlesList } from '@components/article'
import { fetchAPI, getNavigation } from '@lib/api'
import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { Layout } from '@components/common/Layout'
import SearchInput from '@components/search/SearchInput'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'
import { SITE_NAME } from '@lib/constants'

export async function getStaticProps() {
  const categories: TCategory[] = await fetchAPI('/categories')
  const articles: TArticle[] = await fetchAPI('/articles?_limit=-1')
  const navigation: TNavigation = await getNavigation()

  return {
    props: { categories, articles, navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

function SearchPage({
  categories,
  articles,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { query } = useRouter()
  const { q, category, sort } = query

  const stringQuery = q ? decodeURIComponent(q as string).toLowerCase() : ''

  const filteredArticles = articles.filter((a: TArticle) => {
    if (!stringQuery) return false
    const haystack = `${a.title} ${a.description || ''}`.toLowerCase()
    const matchesQuery = haystack.includes(stringQuery)
    if (!matchesQuery) return false
    if (category) {
      return a.category.slug === decodeURIComponent(category as string)
    }
    return true
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const aTime = new Date(a.published_at as string).getTime()
    const bTime = new Date(b.published_at as string).getTime()
    if (sort === 'asc') return aTime - bTime
    return bTime - aTime
  })

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={`${STRINGS.search} | ${SITE_NAME}`}
        description={STRINGS.searchDescription}
        canonical={getCanonicalUrl('/search')}
        noindex
        nofollow
      />

      <header className="archive-hero">
        <h1>{STRINGS.search}</h1>
        <p>{STRINGS.searchDescription}</p>
      </header>

      <SearchInput categories={categories} />

      {sortedArticles.length !== 0 ? (
        <ArticlesList
          articles={sortedArticles}
          title={STRINGS.searchResultCount(sortedArticles.length)}
        />
      ) : (
        <p className="empty-state">
          {stringQuery ? STRINGS.searchNoResults : STRINGS.searchPrompt}
        </p>
      )}
    </Layout>
  )
}

export default SearchPage
