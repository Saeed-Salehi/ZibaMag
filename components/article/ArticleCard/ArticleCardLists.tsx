import { Date } from '@components/ui/Date'
import Link from 'next/link'
import s from './ArticleCard.module.css'
import cn from 'classnames'
import Image from 'next/image'
import ActionButtons from '../Article/ActionButtons'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl } from '@lib/cover'

const ArticleCardList = ({ article }: { article: TArticle }) => {
  const coverUrl = getCoverMediaUrl(article.cover, 'small')

  return (
    <article className={s.lists}>
      <section>
        <Link href={`/${article.category.slug}`}>
          <a className="medium-topic">{article.category.title}</a>
        </Link>
        <Link href={`/lists/${article.slug}`}>
          <a>
            <h3 className={cn(s.title, 'serif')}>{article.title}</h3>
          </a>
        </Link>
        <div className="medium-meta">
          <Link href={`/contributors/${article.author.slug}`}>
            <a>{article.author.name}</a>
          </Link>
          <span>·</span>
          <Date date={article.published_at as string} />
        </div>
        <ActionButtons article={article} />
      </section>

      {coverUrl && (
        <Link href={`/lists/${article.slug}`}>
          <a aria-label={STRINGS.linkTo(article.title)} className={s.cover}>
            <Image
              src={coverUrl}
              alt={article.cover?.alternativeText || ''}
              layout="fill"
              className="object-cover"
            />
          </a>
        </Link>
      )}
    </article>
  )
}

export default ArticleCardList
