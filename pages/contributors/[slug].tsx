import { ArticlesList } from '@components/article'
import { fetchAPI, getNavigation } from '@lib/api'
import { GetStaticPropsContext } from 'next'
import ExternalLink from '@components/ui/Link/ExternalLink'
import Image from 'next/image'
import { Layout } from '@components/common/Layout'
import Twitter from '@components/icons/Twitter'
import { BreadcrumbJsonLd, NextSeo, SocialProfileJsonLd } from 'next-seo'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl, getCoverOgImages } from '@lib/cover'

export async function getStaticPaths() {
  const slugs: TContributor[] = await fetchAPI('/contributors')

  return {
    paths: slugs.map((contributor) => `/contributors/${contributor.slug}`),
    fallback: 'blocking',
  }
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ slug: string }>) {
  const contributor: TContributor = (
    await fetchAPI(`/contributors?slug=${params?.slug}`)
  )[0]

  if (!contributor) return { notFound: true }

  const articles: TArticle[] = await fetchAPI(
    `/articles?author.slug=${params?.slug}`
  )
  const navigation: TNavigation = await getNavigation()

  return {
    props: { contributor, articles, navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

function ContributorPage({
  contributor,
  articles,
  navigation,
}: {
  contributor: TContributor
  articles: TArticle[]
  navigation: TNavigation
}) {
  const isFeatured = !!contributor.featured
  const canonical = getCanonicalUrl(`/contributors/${contributor.slug}`)

  const profileImage = contributor.featured?.profile_image
  const thumbnailUrl = getCoverMediaUrl(profileImage, 'thumbnail')
  const profileOgImages = getCoverOgImages(profileImage)

  const contributorSocialMedia = (urls: TContributor['urls']) => {
    if (!urls) return []

    const { facebook, twitter, instagram, linkedin } = urls

    return [
      facebook && `https://www.facebook.com/${facebook}`,
      instagram && `https://instagram.com/${instagram}`,
      linkedin && `https://www.linkedin.com/in/${linkedin}`,
      twitter && `https://twitter.com/${twitter}`,
    ].filter((elem) => elem !== null)
  }

  const description =
    contributor.featured?.description ||
    STRINGS.articlesBy(contributor.name, contributor.role || undefined)

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={contributor.name}
        description={description}
        canonical={canonical}
        openGraph={{
          title: contributor.name,
          description,
          url: canonical,
          ...(isFeatured &&
            profileOgImages.length > 0 && {
              images: profileOgImages,
            }),
        }}
      />

      <SocialProfileJsonLd
        type="Person"
        name={contributor.name}
        url={canonical}
        sameAs={contributorSocialMedia(contributor.urls) as []}
      />

      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: STRINGS.contributors,
            item: getCanonicalUrl('/contributors'),
          },
          {
            position: 2,
            name: contributor.name,
            item: canonical,
          },
        ]}
      />

      <section className="text-center py-4">
        {isFeatured && thumbnailUrl && (
          <figure className="relative w-24 h-24 mx-auto my-6">
            <Image
              src={thumbnailUrl}
              className="rounded-full"
              alt={`${contributor.name} profile`}
              layout="fill"
            />
          </figure>
        )}
        <h1 className="serif mt-0 text-2xl">{contributor.name}</h1>
        <p className="text-sm font-serif mb-2">{contributor.role}</p>
        {contributor.urls?.twitter && (
          <ExternalLink
            to={`https://twitter.com/${contributor.urls.twitter}`}
            ariaLabel="Contributor's twitter"
            className="flex w-max mx-auto items-center opacity-60 hover:opacity-100"
          >
            <span className="mr-2">
              <Twitter width="18" height="18" />
            </span>
            {contributor.urls.twitter}
          </ExternalLink>
        )}
        {isFeatured && (
          <p className="text-center py-2 leading-tight mt-8 lg:w-4/6 lg:mx-auto">
            {contributor.featured?.description}
          </p>
        )}
      </section>
      <ArticlesList
        articles={articles || []}
        title={STRINGS.allContributions}
      />
    </Layout>
  )
}

export default ContributorPage
