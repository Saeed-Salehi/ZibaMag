import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { ArticlesCarousel, ArticlesList } from '@components/article'
import FeaturedPopularRow from '@components/article/FeaturedPopularRow/FeaturedPopularRow'
import { fetchAPI, getGlobal, getNavigation } from '@lib/api'
import { Layout } from '@components/common/Layout'
import { useMediaQuery } from '@lib/hooks/use-media-queries'
import ArticlesHero from '@components/article/ArticlesHero/ArticlesHero'
import { SEO_DESCRIPTION, SITE_NAME, SITE_URL } from '@lib/constants'
import { STRINGS } from '@lib/strings'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { getArticlePageSections } from '@lib/article-sections'

export async function getStaticProps() {
  const [articles, navigation, global]: [
    TArticle[],
    TNavigation,
    TGlobal | null
  ] = await Promise.all([
    fetchAPI('/articles?_sort=published_at:DESC&_limit=-1'),
    getNavigation(),
    getGlobal(),
  ])

  return {
    props: {
      articles,
      navigation,
      homeHero: global?.homeHero || null,
      homeFeed: global?.homeFeed || [],
    },
    revalidate: REVALIDATE_SECONDS,
  }
}

function Home({
  articles,
  navigation,
  homeHero,
  homeFeed,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const isTablet = useMediaQuery(1023)
  const sections = getArticlePageSections(articles, {
    heroArticle: homeHero,
    feedArticles: homeFeed,
  })

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={SITE_NAME}
        description={SEO_DESCRIPTION}
        canonical={getCanonicalUrl('/')}
        openGraph={{
          title: SITE_NAME,
          description: SEO_DESCRIPTION,
          url: SITE_URL,
        }}
      />
      {isTablet ? (
        <ArticlesCarousel title={STRINGS.topStories} articles={sections.hero} />
      ) : (
        <ArticlesHero articles={sections.hero} />
      )}

      <ArticlesList articles={sections.recent} title={STRINGS.recent} />

      <FeaturedPopularRow
        featured={sections.featured}
        popular={sections.popular}
      />

      <ArticlesList articles={sections.more} title={STRINGS.moreArticles} />

      <div className="feed-cta">
        <Link href="/articles">
          <a className="magazine-btn magazine-btn-ghost">
            {STRINGS.viewAllArticles}
          </a>
        </Link>
      </div>
    </Layout>
  )
}

export default Home
