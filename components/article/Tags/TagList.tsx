import Link from 'next/link'
import { STRINGS } from '@lib/strings'

const TagList = ({ tags }: { tags?: TTag[] }) => {
  if (!tags?.length) return null

  return (
    <div className="article-tags">
      <h2 className="article-engagement-title">{STRINGS.tags}</h2>
      <div className="article-tags-list">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <a className="tag-pill">#{tag.title}</a>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TagList
