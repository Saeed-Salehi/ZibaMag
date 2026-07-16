import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { Layout } from '@components/common/Layout'
import Hero from '@components/common/Hero/Hero'
import { ContactForm } from '@components/contact'
import { getNavigation } from '@lib/api'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'

export async function getStaticProps() {
  const navigation: TNavigation = await getNavigation()

  return {
    props: { navigation },
    revalidate: REVALIDATE_SECONDS,
  }
}

function ContactUsPage({
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const canonical = getCanonicalUrl('/contact-us')

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={STRINGS.contact}
        description={STRINGS.contactDescription}
        canonical={canonical}
        openGraph={{
          title: STRINGS.contact,
          description: STRINGS.contactDescription,
          url: canonical,
        }}
      />
      <Hero title={STRINGS.contact} description={STRINGS.contactDescription} />
      <ContactForm />
    </Layout>
  )
}

export default ContactUsPage
