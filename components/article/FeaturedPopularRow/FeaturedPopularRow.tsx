import ArticlesList from '../ArticlesList/ArticlesList'
import { STRINGS } from '@lib/strings'
import cn from 'classnames'

type Props = {
  featured: TArticle[]
  popular: TArticle[]
}

const FeaturedPopularRow = ({ featured, popular }: Props) => {
  if (featured.length === 0 && popular.length === 0) return null

  const both = featured.length > 0 && popular.length > 0

  return (
    <div
      className={cn(
        'mt-6 pt-2',
        both && 'lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start'
      )}
    >
      {featured.length > 0 && (
        <ArticlesList
          articles={featured}
          title={STRINGS.featured}
          variant="top"
        />
      )}
      {popular.length > 0 && (
        <ArticlesList
          articles={popular}
          title={STRINGS.popular}
          variant="top"
        />
      )}
    </div>
  )
}

export default FeaturedPopularRow
