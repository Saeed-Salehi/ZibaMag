import Link from 'next/link'
import AuthorSocialMedia from './AuthorSocialMedia'
import Image from 'next/image'
import { getCoverMediaUrl } from '@lib/cover'

function AuthorCard({ author }: { author: TContributor }) {
  const thumbnailUrl = getCoverMediaUrl(
    author.featured?.profile_image,
    'thumbnail'
  )

  return (
    <div className="flex py-2 items-center">
      {author.featured && thumbnailUrl && (
        <Link href={`/contributors/${author.slug}`}>
          <figure className="relative w-12 h-12 mr-5 author-avatar">
            <Image
              src={thumbnailUrl}
              className="rounded-full"
              alt={`${author?.name} profile`}
              layout="fill"
            />
          </figure>
        </Link>
      )}

      <div>
        <Link href={`/contributors/${author.slug}`}>
          <a className="serif text-xl">{author.name}</a>
        </Link>

        <AuthorSocialMedia urls={author.urls} />
      </div>
    </div>
  )
}

export default AuthorCard
