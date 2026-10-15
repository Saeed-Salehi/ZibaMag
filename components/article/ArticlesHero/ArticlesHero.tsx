import { Date } from '@components/ui/Date'
import Link from 'next/link'
import Image from 'next/image'
import ArticleCardTop from '../ArticleCard/ArticleCardTop'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl } from '@lib/cover'

const ArticlesHero = ({ articles }: { articles: TArticle[] }) => {
  if (!articles.length) return null

  const heroArticle = articles[0]
  const sideArticles = articles.slice(1)
  const coverUrl = getCoverMediaUrl(heroArticle.cover)

  return (
    <section className="medium-hero">
      <article className="medium-hero-main">
        {coverUrl && (
          <Link href={`/articles/${heroArticle.slug}`}>
            <a aria-label={STRINGS.linkTo(heroArticle.title)}>
              <div className="medium-cover">
                <Image
                  src={coverUrl}
                  alt={heroArticle.cover?.alternativeText || ''}
                  layout="fill"
                  className="object-cover"
                  priority
                />
              </div>
            </a>
          </Link>
        )}

        <Link href={`/${heroArticle.category.slug}`}>
          <a className="medium-topic">{heroArticle.category.title}</a>
        </Link>

        <Link href={`/articles/${heroArticle.slug}`}>
          <a>
            <h3>{heroArticle.title}</h3>
          </a>
        </Link>

        {heroArticle.description && (
          <p className="dek">{heroArticle.description}</p>
        )}

        <div className="medium-meta">
          <Link href={`/contributors/${heroArticle.author.slug}`}>
            <a>{heroArticle.author.name}</a>
          </Link>
          <span>·</span>
          <Date date={heroArticle.published_at as string} />
        </div>
      </article>

      <aside>
        <p className="medium-side-title">{STRINGS.topStories}</p>
        {sideArticles.map((article, index) => (
          <ArticleCardTop article={article} index={index} key={article.slug} />
        ))}
      </aside>
    </section>
  )
}

export default ArticlesHero
