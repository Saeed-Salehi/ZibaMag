import { ArticlesList } from '@components/article'
import { Layout } from '@components/common/Layout'
import Bookmark from '@components/icons/Bookmark'
import { useList } from '@lib/hooks/use-list'
import { NextSeo } from 'next-seo'

const ListsPage = () => {
  const { list } = useList()

  return (
    <Layout>
      <NextSeo noindex nofollow title="Saved articles" />
      {list && list.length !== 0 ? (
        <ArticlesList
          articles={list}
          title={
            list.length === 1
              ? `${list.length} Article`
              : `${list.length} Articles`
          }
          variant="lists"
        />
      ) : (
        <div className="text-center my-auto">
          <p>You haven&apos;t saved anything yet.</p>
          <p>
            Tap the{' '}
            <span>
              <Bookmark className="inline-block" />
            </span>{' '}
            icon to save them for later.
          </p>
        </div>
      )}
    </Layout>
  )
}

export default ListsPage
