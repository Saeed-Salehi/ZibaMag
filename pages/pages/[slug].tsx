import { fetchAPI, getMediaURL, getNavigation } from '@lib/api'
import { GetStaticPropsContext } from 'next'
import ExitPreviewButton from '@components/common/ExitPreviewButton'
import { NextSeo } from 'next-seo'
import { Layout } from '@components/common/Layout'
import Markdown from '@components/common/Markdown/Markdown'
import Image from 'next/image'
import { getCanonicalUrl, getPreviewRobots, REVALIDATE_SECONDS } from '@lib/seo'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({
  params,
  preview = false,
}: GetStaticPropsContext<{ slug: string }>) {
  const page: TPage = (
    await fetchAPI(
      `/pages?slug=${params?.slug}${
        preview ? '&_publicationState=preview' : ''
      }`
    )
  )[0]
  const navigation: TNavigation = await getNavigation()

  if (!page) return { notFound: true }

  return {
    props: { page, navigation, preview },
    revalidate: REVALIDATE_SECONDS,
  }
}

function PagesPage({
  page,
  preview,
  navigation,
}: {
  page: TPage
  preview: boolean
  navigation: TNavigation
}) {
  const canonical = getCanonicalUrl(`/pages/${page.slug}`)

  return (
    <Layout navigation={navigation} isMarkdown>
      <NextSeo
        title={page.title}
        description={page.description}
        canonical={canonical}
        {...getPreviewRobots(preview)}
        openGraph={{
          title: page.title,
          description: page.description,
          url: canonical,
          ...(page.cover && {
            images: Object.values(page.cover.formats).map((image) => {
              return {
                url: getMediaURL(image?.url),
                width: image?.width,
                height: image?.height,
              }
            }),
          }),
        }}
      />

      <header>
        <h1 className="serif pb-4">{page.title}</h1>
      </header>

      {page.cover && (
        <div className="mt-4 mb-8">
          <Image
            src={getMediaURL(
              page.cover?.formats.medium?.url || page?.cover?.url
            )}
            alt={page?.cover?.alternativeText || ''}
            width={page?.cover?.width}
            height={page?.cover?.height}
          />
        </div>
      )}

      <Markdown content={page.content} />
      {preview && <ExitPreviewButton />}
    </Layout>
  )
}

export default PagesPage
