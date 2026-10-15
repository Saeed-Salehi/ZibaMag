import { useState } from 'react'
import { rateArticle } from '@lib/api'
import { averageRating } from '@lib/articles'
import { STRINGS } from '@lib/strings'
import cn from 'classnames'

type Props = {
  article: TArticle
  interactive?: boolean
}

const StarRating = ({ article, interactive = true }: Props) => {
  const initial = Math.round(averageRating(article))
  const [hover, setHover] = useState(0)
  const [saved, setSaved] = useState(initial)
  const [count, setCount] = useState(article.ratingCount || 0)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const display = hover || saved

  const onRate = async (value: number) => {
    if (!interactive || busy) return
    setBusy(true)
    try {
      const updated = await rateArticle(article.id, value)
      setSaved(Math.round(averageRating(updated)))
      setCount(updated.ratingCount || count + 1)
      setMessage(STRINGS.ratingThanks)
    } catch {
      setMessage(STRINGS.ratingError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={STRINGS.rateArticle}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={!interactive || busy}
            className={cn(
              'text-2xl leading-none transition-transform',
              interactive && 'hover:scale-110',
              value <= display ? 'text-accent' : 'text-primary-20'
            )}
            onMouseEnter={() => interactive && setHover(value)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate(value)}
            aria-label={`${value}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-primary-60">
        {count > 0
          ? `${count.toLocaleString('fa-IR')} ${STRINGS.rating}`
          : STRINGS.rateArticle}
      </span>
      {message && <span className="text-sm text-accent">{message}</span>}
    </div>
  )
}

export default StarRating
