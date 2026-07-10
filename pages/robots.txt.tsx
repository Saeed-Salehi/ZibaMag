import { SITE_URL } from '@lib/constants'
import { NextPageContext } from 'next'

const createRobotsTxt = () => `User-agent: *
Allow: /

Disallow: /search
Disallow: /lists
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`

export async function getServerSideProps({ res }: NextPageContext) {
  res?.setHeader('Content-Type', 'text/plain')
  res?.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  )
  res?.write(createRobotsTxt())
  res?.end()

  return { props: {} }
}

export default () => null
