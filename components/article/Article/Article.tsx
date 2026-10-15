import Link from 'next/link'
import { Markdown } from '@components/common/Markdown'
import { Date } from '@components/ui/Date'
import ActionButtons from './ActionButtons'
import Image from 'next/image'
import { STRINGS } from '@lib/strings'
import { getCoverMediaUrl } from '@lib/cover'
import TagList from '../Tags/TagList'
import StarRating from '../Engagement/StarRating'
import CommentSection from '../Engagement/CommentSection'
import RelatedArticles from '../RelatedArticles/RelatedArticles'

function Article({
  article,
  comments = [],
  related = [],
}: {
  article: TArticle | undefined
  comments?: TComment[]
  related?: TArticle[]
}) {
  if (!article) return <p>{STRINGS.somethingWentWrong}</p>

  const coverUrl = getCoverMediaUrl(article.cover, 'medium')

  return (
    <article className="article-page">
      <header className="article-header">
        <div className="medium-meta article-header-meta">
          <Link href={`/${article.category.slug}`}>
            <a className="medium-topic">{article.category.title}</a>
          </Link>
          {article.featured && <span>★ {STRINGS.featuredStar}</span>}
          {(article.views || 0) > 0 && (
            <span>
              {(article.views || 0).toLocaleString('fa-IR')} {STRINGS.views}
            </span>
          )}
        </div>

        <h1 className="article-title serif">{article.title}</h1>

        <div className="medium-meta">
          <span>
            {STRINGS.by}{' '}
            <Link href={`/contributors/${article.author.slug}`}>
              <a>{article.author.name}</a>
            </Link>
          </span>
          <span>·</span>
          <Date date={article.published_at as string} />
        </div>

        <ActionButtons article={article} />

        {coverUrl && article.cover && (
          <div className="article-cover">
            <Image
              src={coverUrl}
              alt={article.cover.alternativeText || ''}
              width={article.cover.width}
              height={article.cover.height}
              priority
            />
          </div>
        )}
      </header>

      <Markdown content={article.content} />

      <section className="article-engagement" aria-label={STRINGS.comments}>
        <div className="article-engagement-block">
          <h2 className="article-engagement-title">{STRINGS.rateArticle}</h2>
          <StarRating article={article} />
        </div>

        <div className="article-engagement-block">
          <TagList tags={article.tags} />
        </div>

        <CommentSection articleId={article.id} comments={comments} />
      </section>

      <RelatedArticles articles={related} />
    </article>
  )
}

export default Article
