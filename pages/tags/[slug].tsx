import { GetStaticPropsContext } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { ArticlesList } from '@components/article'
import { Layout } from '@components/common/Layout'
import { Hero } from '@components/common/Hero'
import { fetchAPI, getNavigation } from '@lib/api'
import { TAG_PAGE_MIN_ARTICLES } from '@lib/articles'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'

export async function getStaticPaths() {
  const tags: TTag[] = await fetchAPI('/tags?_limit=-1').catch(() => [])
  const withCounts = await Promise.all(
    tags.map(async (tag) => {
      const articles: TArticle[] = await fetchAPI(
        `/articles?tags.slug=${tag.slug}&_limit=-1`
      ).catch(() => [])
      return { tag, count: articles.length }
    })
  )

  return {
    paths: withCounts
      .filter((row) => row.count >= TAG_PAGE_MIN_ARTICLES)
      .map((row) => `/tags/${row.tag.slug}`),
    fallback: 'blocking',
  }
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ slug: string }>) {
  const tag: TTag = (
    await fetchAPI(`/tags?slug=${params?.slug}`).catch(() => [])
  )[0]
  if (!tag) return { notFound: true }

  const articles: TArticle[] = await fetchAPI(
    `/articles?tags.slug=${params?.slug}&_sort=published_at:DESC&_limit=-1`
  ).catch(() => [])

  if (articles.length < TAG_PAGE_MIN_ARTICLES) {
    return { notFound: true }
  }

  const navigation: TNavigation = await getNavigation()

  return {
    props: { tag, articles, navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

function TagPage({
  tag,
  articles,
  navigation,
}: {
  tag: TTag
  articles: TArticle[]
  navigation: TNavigation
}) {
  const canonical = getCanonicalUrl(`/tags/${tag.slug}`)
  const description = tag.description || STRINGS.tagPageDescription(tag.title)

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={`#${tag.title}`}
        description={description}
        canonical={canonical}
        openGraph={{
          title: `#${tag.title}`,
          description,
          url: canonical,
        }}
      />
      <Hero title={`#${tag.title}`} description={description} />
      <p className="text-center text-sm text-primary-40 mb-6">
        {STRINGS.articleCount(articles.length)}
      </p>
      <ArticlesList articles={articles} title="" className="mt-0" />
      <div className="text-center mt-10">
        <Link href="/articles">
          <a className="text-accent font-bold hover:underline">
            {STRINGS.viewAllArticles}
          </a>
        </Link>
      </div>
    </Layout>
  )
}

export default TagPage
