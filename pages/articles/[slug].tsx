import { fetchAPI, getNavigation } from '@lib/api'
import { GetStaticPropsContext } from 'next'
import { Article } from '@components/article'
import { ArticleJsonLd, NextSeo } from 'next-seo'
import ExitPreviewButton from '@components/common/ExitPreviewButton'
import { Layout } from '@components/common/Layout'
import ArrowLeft from '@components/icons/ArrowLeft'
import { Button } from '@components/ui/Button'
import { SITE_LOGO_URL, SITE_NAME } from '@lib/constants'
import { getCanonicalUrl, getPreviewRobots, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'
import { getCoverOgImages, getCoverOgImageUrls } from '@lib/cover'

export async function getStaticPaths() {
  const articles: TArticle[] = await fetchAPI('/articles')

  return {
    paths: articles.map((article) => `/articles/${article.slug}`),
    fallback: 'blocking',
  }
}

export async function getStaticProps({
  params,
  preview = false,
}: GetStaticPropsContext<{ slug: string }>) {
  const article: TArticle = (
    await fetchAPI(
      `/articles?slug=${params?.slug}${
        preview ? '&_publicationState=preview' : ''
      }`
    )
  )[0]

  const navigation: TNavigation = await getNavigation()

  if (!article) return { notFound: true }

  return {
    props: { preview, navigation, article },
    revalidate: REVALIDATE_SECONDS,
  }
}

function ArticlePage({
  article,
  navigation,
  preview,
}: {
  article: TArticle
  navigation: TNavigation
  preview: boolean
}) {
  const fullURL = getCanonicalUrl(`/articles/${article.slug}`)
  const authorURL = getCanonicalUrl(`/contributors/${article.author.slug}`)

  return (
    <Layout navigation={navigation} isMarkdown>
      <NextSeo
        title={article.title}
        description={article.description}
        canonical={fullURL}
        {...getPreviewRobots(preview)}
        openGraph={{
          title: article.title,
          description: article.description,
          url: fullURL,
          type: 'article',
          article: {
            publishedTime: article.published_at as string,
            modifiedTime: article.updated_at as string,
            section: article.category.title,
            authors: [authorURL],
            tags: [article.category.title],
          },
          ...(getCoverOgImages(article.cover).length > 0 && {
            images: getCoverOgImages(article.cover),
          }),
        }}
      />
      <ArticleJsonLd
        url={fullURL}
        title={article.title as string}
        datePublished={article.published_at as string}
        dateModified={article.updated_at as string}
        authorName={[article.author.name as string]}
        publisherName={SITE_NAME}
        publisherLogo={SITE_LOGO_URL}
        description={article.description as string}
        images={getCoverOgImageUrls(article.cover)}
      />

      <Button ariaLabel={STRINGS.goBack} href="/" className="-ml-2 back-button">
        <ArrowLeft className="icon-mirror" />
      </Button>
      <Article article={article} />
      {preview && <ExitPreviewButton />}
    </Layout>
  )
}

export default ArticlePage
