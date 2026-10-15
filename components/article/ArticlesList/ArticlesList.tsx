import { ArticleCard } from '..'
import ArticleCardLists from '../ArticleCard/ArticleCardLists'
import ArticleCardTop from '../ArticleCard/ArticleCardTop'
import cn from 'classnames'

type Props = {
  articles: TArticle[]
  title: string
  variant?: 'default' | 'lists' | 'top'
  className?: string
}

const ArticlesList = ({
  articles,
  title,
  variant = 'default',
  className = '',
}: Props) => {
  if (articles.length === 0) return null

  const renderCards = () => {
    if (variant === 'lists') {
      return articles.map((article) => (
        <ArticleCardLists article={article} key={article.slug} />
      ))
    }
    if (variant === 'top') {
      return articles.map((article, index) => (
        <ArticleCardTop article={article} index={index} key={article.slug} />
      ))
    }
    return articles.map((article) => (
      <ArticleCard article={article} key={article.slug} />
    ))
  }

  return (
    <section className={cn(className)}>
      {title ? (
        <div className="section-heading">
          <h2>{title}</h2>
        </div>
      ) : null}
      <div className={variant === 'default' ? 'articles-stack' : undefined}>
        {renderCards()}
      </div>
    </section>
  )
}

export default ArticlesList
