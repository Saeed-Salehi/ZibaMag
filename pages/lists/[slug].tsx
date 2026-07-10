import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Custom404 from 'pages/404'
import Link from 'next/link'
import { get } from 'idb-keyval'

import { Article } from '@components/article'
import { Layout } from '@components/common/Layout'
import ArrowLeft from '@components/icons/ArrowLeft'
import { NextSeo } from 'next-seo'
import { STRINGS } from '@lib/strings'

function ArticlePage() {
  const [article, setArticle] = useState<TArticle | 'loading' | null>('loading')

  const {
    query: { slug },
  } = useRouter()

  useEffect(() => {
    const getArticle = async () => {
      const indexedArticle = await get(slug?.toString() || '')
      if (!indexedArticle) return setArticle(null)
      return setArticle(JSON.parse(indexedArticle))
    }
    getArticle()
  }, [slug])

  if (!article) {
    return <Custom404 />
  }

  if (article === 'loading') {
    return <p>{STRINGS.loading}</p>
  }

  return (
    <Layout>
      <NextSeo noindex nofollow title={STRINGS.savedArticle} />
      <Link href={'/lists'}>
        <a aria-label={STRINGS.goBack}>
          <ArrowLeft className="icon-mirror" />
        </a>
      </Link>
      <Article article={article as TArticle} />
    </Layout>
  )
}

export default ArticlePage
