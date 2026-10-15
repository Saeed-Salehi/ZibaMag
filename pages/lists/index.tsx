import { ArticlesList } from '@components/article'
import { Layout } from '@components/common/Layout'
import Bookmark from '@components/icons/Bookmark'
import { useList } from '@lib/hooks/use-list'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { STRINGS } from '@lib/strings'
import { SITE_NAME } from '@lib/constants'

const ListsPage = () => {
  const { list } = useList()

  return (
    <Layout>
      <NextSeo
        noindex
        nofollow
        title={`${STRINGS.savedArticles} | ${SITE_NAME}`}
      />

      <header className="archive-hero">
        <h1>{STRINGS.savedArticles}</h1>
        <p>
          {list && list.length
            ? STRINGS.articleCount(list.length)
            : STRINGS.noSavedArticles}
        </p>
      </header>

      {list && list.length !== 0 ? (
        <ArticlesList
          articles={list}
          title=""
          variant="lists"
          className="mt-0"
        />
      ) : (
        <div className="empty-state">
          <Bookmark width="28" height="28" />
          <p>{STRINGS.noSavedArticles}</p>
          <p className="empty-state-hint">
            {STRINGS.saveArticlesHint}{' '}
            <Bookmark className="inline-block" width="16" height="16" />{' '}
            {STRINGS.saveArticlesHintEnd}
          </p>
          <Link href="/articles">
            <a className="magazine-btn magazine-btn-ghost">
              {STRINGS.viewAllArticles}
            </a>
          </Link>
        </div>
      )}
    </Layout>
  )
}

export default ListsPage
