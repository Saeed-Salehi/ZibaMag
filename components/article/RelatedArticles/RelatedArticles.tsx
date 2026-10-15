import { ArticlesList } from '@components/article'
import { STRINGS } from '@lib/strings'

const RelatedArticles = ({ articles }: { articles: TArticle[] }) => {
  if (!articles.length) return null
  return (
    <section className="mt-10 pt-8 border-t border-primary-10">
      <ArticlesList
        articles={articles}
        title={STRINGS.relatedArticles}
        className="mt-0"
      />
    </section>
  )
}

export default RelatedArticles
