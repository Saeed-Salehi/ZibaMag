import { ArticlesCarousel, ArticlesList } from '@components/article'
import { Hero } from '@components/common/Hero'
import { GetStaticPropsContext } from 'next'
import { fetchAPI, getMediaURL, getNavigation } from '@lib/api'
import { NextSeo } from 'next-seo'
import { Layout } from '@components/common/Layout'
import { useMediaQuery } from '@lib/hooks/use-media-queries'
import ArticlesHero from '@components/article/ArticlesHero/ArticlesHero'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'

export async function getStaticPaths() {
  const categories: TCategory[] = await fetchAPI('/categories')
  return {
    paths: categories.map((category) => `/${category.slug}`),
    fallback: 'blocking',
  }
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ slug: string }>) {
  const category: TCategory = (
    await fetchAPI(`/categories?slug=${params?.slug}`)
  )[0]

  if (!category) return { notFound: true }

  const articles: TArticle[] = await fetchAPI(
    `/articles?category.slug=${params?.slug}`
  )
  const navigation: TNavigation = await getNavigation()

  return {
    props: {
      category,
      navigation,
      articles,
    },
    revalidate: REVALIDATE_SECONDS,
  }
}

function CategoryPage({
  category,
  articles,
  navigation,
}: {
  category: TCategory
  articles: TArticle[]
  navigation: TNavigation
}) {
  const isTablet = useMediaQuery(1023)
  const canonical = getCanonicalUrl(`/${category.slug}`)

  const seo = (
    <NextSeo
      title={category.title}
      description={category.description}
      canonical={canonical}
      openGraph={{
        title: category.title,
        description: category.description,
        url: canonical,
        ...(category.cover && {
          images: Object.values(category.cover.formats).map((image) => {
            return {
              url: getMediaURL(image?.url),
              width: image?.width,
              height: image?.height,
            }
          }),
        }),
      }}
    />
  )

  if (articles.length === 0) {
    return (
      <>
        {seo}
        <Layout navigation={navigation}>
          <Hero title={category.title} />
          <div className="text-center my-auto">
            <p>{STRINGS.noArticles}</p>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      {seo}

      <Layout navigation={navigation}>
        <Hero title={category.title} />
        {isTablet ? (
          <ArticlesCarousel title={STRINGS.topStories} articles={articles} />
        ) : (
          <ArticlesHero articles={articles} />
        )}

        <ArticlesList articles={articles} title={STRINGS.recent} />

        <div className="lg:py-24 lg:flex lg:gap-28 lg:mx-auto">
          <ArticlesList
            articles={articles}
            title={STRINGS.featured}
            variant="top"
            className="lg:w-1/2"
          />
          <ArticlesList
            articles={articles}
            title={STRINGS.popular}
            variant="top"
            className="lg:w-1/2"
          />
        </div>

        <ArticlesList articles={articles} title={STRINGS.moreArticles} />
      </Layout>
    </>
  )
}

export default CategoryPage
