import Contributor from '@components/contributor/Contributor'
import ContributorFeatured from '@components/contributor/ContributorFeatured'
import { Layout } from '@components/common/Layout'
import Hero from '@components/common/Hero/Hero'
import { fetchAPI, getNavigation } from '@lib/api'
import { partition } from '@lib/partition'
import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'

export async function getStaticProps() {
  const contributors: TContributor[] = await fetchAPI('/contributors')
  const navigation: TNavigation = await getNavigation()

  return {
    props: { contributors, navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

export function ContributorsPage({
  contributors,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [featured, others] = partition<TContributor>(
    contributors,
    (i) => !!i.featured
  )

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={STRINGS.contributors}
        description={STRINGS.contributorsDescription}
        canonical={getCanonicalUrl('/contributors')}
        openGraph={{
          title: STRINGS.contributors,
          description: STRINGS.contributorsDescription,
          url: getCanonicalUrl('/contributors'),
        }}
      />
      <Hero title={STRINGS.contributors} />
      <ul className="flex flex-col flex-wrap justify-between md:flex-row md:py-6">
        {featured.map((contributor) => (
          <ContributorFeatured
            contributor={contributor}
            key={contributor.slug}
          />
        ))}
      </ul>
      <h6 className="font-normal pt-4">{STRINGS.moreContributors}</h6>
      <ul>
        {others.map((contributor) => (
          <Contributor contributor={contributor} key={contributor.slug} />
        ))}
      </ul>
    </Layout>
  )
}

export default ContributorsPage
