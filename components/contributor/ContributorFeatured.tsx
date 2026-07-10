import Link from 'next/link'
import Image from 'next/image'
import s from './Contributor.module.css'
import { getCoverMediaUrl } from '@lib/cover'

const ContributorFeatured = ({
  contributor,
}: {
  contributor: TContributor
}) => {
  const thumbnailUrl = getCoverMediaUrl(
    contributor?.featured?.profile_image,
    'thumbnail'
  )

  return (
    <li>
      <Link href={`/contributors/${contributor.slug}`}>
        <a className={s.featuredContributor}>
          {thumbnailUrl && (
            <figure className="relative w-16 h-16">
              <Image
                src={thumbnailUrl}
                className="rounded-full"
                alt={`${contributor?.name} profile`}
                layout="fill"
              />
            </figure>
          )}
          <div className="ml-5 contributor-info">
            <h3 className="serif ">{contributor.name}</h3>
            <p className="text-xs text-primary-60">{contributor.role}</p>
          </div>
        </a>
      </Link>
    </li>
  )
}

export default ContributorFeatured
