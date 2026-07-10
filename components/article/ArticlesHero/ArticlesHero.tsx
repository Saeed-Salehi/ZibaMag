import { Date } from '@components/ui/Date'
import Link from 'next/link'
import s from '../ArticleCard/ArticleCard.module.css'
import cn from 'classnames'
import Image from 'next/image'
import ArticleCardTop from '../ArticleCard/ArticleCardTop'
import ActionButtons from '../Article/ActionButtons'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl } from '@lib/cover'

const ArticlesHero = ({ articles }: { articles: TArticle[] }) => {
  const heroArticle =
    articles.find((article) => getCoverMediaUrl(article.cover)) || articles[0]
  const coverUrl = getCoverMediaUrl(heroArticle.cover)

  return (
    <section className="mb-4 flex justify-between items-center">
      <div style={{ width: '45%' }}>
        <article className={s.hero}>
          <Link href={`/articles/${heroArticle.slug}`}>
            <a aria-label={STRINGS.linkTo(heroArticle.title)}>
              {coverUrl && (
                <div className={s.cover}>
                  <Image
                    src={coverUrl}
                    alt={heroArticle.cover?.alternativeText || ''}
                    layout="fill"
                    className="object-cover"
                  />
                </div>
              )}
            </a>
          </Link>

          <section className="pt-8">
            <Link href={`/${heroArticle.category.slug}`}>
              <a className="text-sm font-bold px-2 py-1 text-accent border border-accent rounded-sm hover:underline">
                {heroArticle.category.title}
              </a>
            </Link>
            <Link href={`/articles/${heroArticle.slug}`}>
              <a>
                <h3
                  className={cn(
                    s.title,
                    'serif leading-tight overflow-hidden max-h-28 mt-4 mb-2 hover:underline'
                  )}
                >
                  {heroArticle.title}
                </h3>
              </a>
            </Link>
            <div className="flex text-sm w-full items-center">
              <div className="flex self-end items-center">
                {STRINGS.by}
                <Link href={`/contributors/${heroArticle.author.slug}`}>
                  <a className="pl-1 pr-2 font-bold hover:underline">
                    {heroArticle.author.name}
                  </a>
                </Link>
                {' | '}
                <Date
                  className="px-2"
                  date={heroArticle.published_at as string}
                />
              </div>
              <ActionButtons article={heroArticle} />
            </div>
          </section>
        </article>
      </div>

      <div style={{ width: '45%' }}>
        {articles.slice(0, 4).map((article, index) => (
          <ArticleCardTop
            article={article}
            index={index + 1}
            key={article.slug}
          />
        ))}
      </div>
    </section>
  )
}

export default ArticlesHero
