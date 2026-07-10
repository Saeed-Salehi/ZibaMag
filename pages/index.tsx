import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { ArticlesCarousel, ArticlesList } from '@components/article'
import { fetchAPI, getNavigation } from '@lib/api'
import { Layout } from '@components/common/Layout'
import { useMediaQuery } from '@lib/hooks/use-media-queries'
import ArticlesHero from '@components/article/ArticlesHero/ArticlesHero'
import { SEO_DESCRIPTION, SITE_NAME, SITE_URL } from '@lib/constants'
import { STRINGS } from '@lib/strings'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'

export async function getStaticProps() {
  const articles: TArticle[] = await fetchAPI('/articles')
  const navigation: TNavigation = await getNavigation()

  return {
    props: { articles, navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

function Home({
  articles,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const isTablet = useMediaQuery(1023)

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
        //Tablet and smaller devices
        <ArticlesCarousel
          title={STRINGS.topStories}
          articles={articles.slice(0, 4)}
        />
      ) : (
        <ArticlesHero articles={articles.slice(0, 4)} />
      )}

      <ArticlesList articles={articles.slice(5, 10)} title={STRINGS.recent} />

      <div className="lg:py-24 lg:flex lg:w-full lg:gap-28 lg:mx-auto">
        <ArticlesList
          articles={articles.slice(0, 5)}
          title={STRINGS.featured}
          variant="top"
          className="lg:w-1/2"
        />
        <ArticlesList
          articles={articles.slice(6, 11)}
          title={STRINGS.popular}
          variant="top"
          className="lg:w-1/2"
        />
      </div>

      <ArticlesList
        articles={articles.slice(10, 15)}
        title={STRINGS.moreArticles}
      />
    </Layout>
  )
}

export default Home
