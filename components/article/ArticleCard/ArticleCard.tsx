import { Date } from '@components/ui/Date'
import Link from 'next/link'
import s from './ArticleCard.module.css'
import cn from 'classnames'
import Image from 'next/image'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl } from '@lib/cover'

type Props = {
  article: TArticle
  variant?: 'default' | 'carousel'
}

const ArticleCard = ({ article, variant = 'default' }: Props) => {
  const rootClassName = cn({
    [s.default]: variant === 'default',
    [s.carousel]: variant === 'carousel',
  })
  const coverUrl = getCoverMediaUrl(article.cover, 'medium')

  return (
    <article className={rootClassName}>
      <section className={s.body}>
        <Link href={`/${article.category.slug}`}>
          <a className="medium-topic">{article.category.title}</a>
        </Link>

        <Link href={`/articles/${article.slug}`}>
          <a>
            <h3 className={cn(s.title, 'serif')}>{article.title}</h3>
          </a>
        </Link>

        {variant === 'default' && article.description && (
          <Link href={`/articles/${article.slug}`}>
            <a className={s.dek}>{article.description}</a>
          </Link>
        )}

        <div className="medium-meta">
          <Link href={`/contributors/${article.author.slug}`}>
            <a>{article.author.name}</a>
          </Link>
          <span>·</span>
          <Date
            date={article.published_at as string}
            className="text-xs text-primary-60"
          />
          {(article.views || 0) > 0 && (
            <>
              <span>·</span>
              <span>
                {(article.views || 0).toLocaleString('fa-IR')} {STRINGS.views}
              </span>
            </>
          )}
          {article.featured && (
            <>
              <span>·</span>
              <span>{STRINGS.featuredStar}</span>
            </>
          )}
        </div>
      </section>

      {coverUrl && (
        <Link href={`/articles/${article.slug}`}>
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

export default ArticleCard
