import { Date } from '@components/ui/Date'
import Link from 'next/link'
import s from './ArticleCard.module.css'
import cn from 'classnames'

type Props = {
  article: TArticle
  index: number
}

const ArticleCardTop = ({ article, index }: Props) => {
  return (
    <article className={s.top}>
      <div className={s.topNumber}>{index + 1}</div>
      <section>
        <Link href={`/contributors/${article.author.slug}`}>
          <a className="medium-meta" style={{ marginBottom: 4 }}>
            {article.author.name}
          </a>
        </Link>
        <Link href={`/articles/${article.slug}`}>
          <a>
            <h3 className={cn(s.title, 'serif')}>{article.title}</h3>
          </a>
        </Link>
        <div className="medium-meta">
          <Date date={article.published_at as string} />
          <span>·</span>
          <Link href={`/${article.category.slug}`}>
            <a>{article.category.title}</a>
          </Link>
        </div>
      </section>
    </article>
  )
}

export default ArticleCardTop
