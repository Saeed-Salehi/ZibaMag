import Link from 'next/link'
import { Markdown } from '@components/common/Markdown'
import AuthorCard from './AuthorCard'
import { Date } from '@components/ui/Date'
import ActionButtons from './ActionButtons'
import { getMediaURL } from '@lib/api'
import Image from 'next/image'
import { STRINGS } from '@lib/strings'

function Article({ article }: { article: TArticle | undefined }) {
  if (!article) return <p>{STRINGS.somethingWentWrong}</p>

  return (
    <article>
      <header className="py-10">
        <Link href={`/${article.category.slug}`}>
          <a className="text-sm font-bold text-accent">
            {article.category.title}
          </a>
        </Link>

        <h1 className="serif pb-4">{article.title}</h1>

        <p className="mb-2">
          {STRINGS.by}{' '}
          <Link href={`/contributors/${article.author.slug}`}>
            <a className="pl-1 pr-2 font-bold hover:underline">
              {article.author.name}
            </a>
          </Link>
        </p>

        <Date date={article.published_at as string} />

        <ActionButtons article={article} />

        <div className="my-8">
          <Image
            src={getMediaURL(
              article.cover.formats.medium?.url || article.cover.url
            )}
            alt={article.cover.alternativeText || ''}
            width={article.cover.width}
            height={article.cover.height}
          />
        </div>
      </header>

      <Markdown content={article.content} />

      <footer className="border-t py-6 mt-24">
        <AuthorCard author={article.author} />
        <ActionButtons article={article} />
      </footer>
    </article>
  )
}

export default Article
