import { useRouter } from 'next/router'
import { ArticlesList } from '@components/article'
import { fetchAPI, getNavigation } from '@lib/api'
import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { Layout } from '@components/common/Layout'
import SearchInput from '@components/search/SearchInput'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'

export async function getStaticProps() {
  const categories: TCategory[] = await fetchAPI('/categories')
  const articles: TArticle[] = await fetchAPI('/articles')
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
    if (category) {
      return (
        a.title.toLowerCase().includes(stringQuery) &&
        a.category.slug === decodeURIComponent(category as string)
      )
    }
    return a.title.toLowerCase().includes(stringQuery)
  })

  const sortedArticles = filteredArticles.sort((a: TArticle, b: TArticle) => {
    const key = 'published_at'
    if (sort === 'desc') return a[key] < b[key] ? 1 : a[key] > b[key] ? -1 : 0
    return a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
  })

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title="Search"
        description="Search articles across the magazine."
        canonical={getCanonicalUrl('/search')}
        noindex
        nofollow
      />
      <main className="min-h-screen px-4 pt-6 pb-20 flex flex-col mx-auto md:w-3/4 lg:w-2/3 xl:w-7/12">
        <SearchInput categories={categories} />

        {sortedArticles.length !== 0 ? (
          <ArticlesList
            articles={sortedArticles}
            title={`${sortedArticles.length} ${
              sortedArticles.length > 1 ? 'results' : 'result'
            }`}
          />
        ) : (
          <p className="text-center my-auto text-secondary">
            {stringQuery
              ? "We couldn't find anything"
              : 'Enter a search term to find articles'}
          </p>
        )}
      </main>
    </Layout>
  )
}

export default SearchPage
