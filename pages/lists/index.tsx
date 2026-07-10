import { ArticlesList } from '@components/article'
import { Layout } from '@components/common/Layout'
import Bookmark from '@components/icons/Bookmark'
import { useList } from '@lib/hooks/use-list'
import { NextSeo } from 'next-seo'
import { STRINGS } from '@lib/strings'

const ListsPage = () => {
  const { list } = useList()

  return (
    <Layout>
      <NextSeo noindex nofollow title={STRINGS.savedArticles} />
      {list && list.length !== 0 ? (
        <ArticlesList
          articles={list}
          title={STRINGS.articleCount(list.length)}
          variant="lists"
        />
      ) : (
        <div className="text-center my-auto">
          <p>{STRINGS.noSavedArticles}</p>
          <p>
            {STRINGS.saveArticlesHint}{' '}
            <span>
              <Bookmark className="inline-block" />
            </span>{' '}
            {STRINGS.saveArticlesHintEnd}
          </p>
        </div>
      )}
    </Layout>
  )
}

export default ListsPage
