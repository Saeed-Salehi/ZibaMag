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
import { getRelatedArticles } from '@lib/articles'
import ViewTracker from '@components/article/Engagement/ViewTracker'

export async function getStaticPaths() {
  const articles: TArticle[] = await fetchAPI('/articles?_limit=-1')

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

  const [allArticles, comments]: [TArticle[], TComment[]] = await Promise.all([
    fetchAPI('/articles?_limit=-1'),
    fetchAPI(
      `/comments?article=${article.id}&approved=true&_sort=created_at:DESC`
    ).catch(() => []),
  ])

  const related = getRelatedArticles(article, allArticles)

  return {
    props: {
      preview,
      navigation,
      article,
      comments,
      related,
    },
    revalidate: REVALIDATE_SECONDS,
  }
}

function ArticlePage({
  article,
  navigation,
  preview,
  comments,
  related,
}: {
  article: TArticle
  navigation: TNavigation
  preview: boolean
  comments: TComment[]
  related: TArticle[]
}) {
  const fullURL = getCanonicalUrl(`/articles/${article.slug}`)
  const authorURL = getCanonicalUrl(`/contributors/${article.author.slug}`)
  const tagTitles = (article.tags || []).map((tag) => tag.title)

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
            tags: tagTitles.length ? tagTitles : [article.category.title],
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

      <ViewTracker articleId={article.id} />

      <Button
        ariaLabel={STRINGS.goBack}
        href="/"
        className="article-back back-button"
      >
        <ArrowLeft className="icon-mirror" />
      </Button>
      <Article article={article} comments={comments} related={related} />
      {preview && <ExitPreviewButton />}
    </Layout>
  )
}

export default ArticlePage
