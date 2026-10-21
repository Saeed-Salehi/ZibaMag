import { useEffect, useRef, useState } from 'react'
import { getArticleRating, rateArticle, TRatingResult } from '@lib/api'
import { averageRating } from '@lib/articles'
import { STRINGS } from '@lib/strings'
import cn from 'classnames'

type Props = {
  article: TArticle
  interactive?: boolean
}

function starFill(average: number) {
  if (average <= 0) return 0
  return Math.max(1, Math.min(5, Math.round(average)))
}

function formatAverage(average: number) {
  return average.toLocaleString('fa-IR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

const StarRating = ({ article, interactive = true }: Props) => {
  const [hover, setHover] = useState(0)
  const [average, setAverage] = useState(() => averageRating(article))
  const [count, setCount] = useState(() => Number(article.ratingCount) || 0)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  const display = hover || starFill(average)

  const applyResult = (result: TRatingResult) => {
    const nextAverage = averageRating(result)
    setAverage(nextAverage)
    setCount(Number(result.ratingCount) || 0)
    if (result.userRating) setUserRating(result.userRating)
  }

  useEffect(() => {
    let cancelled = false
    getArticleRating(article.id)
      .then((result) => {
        if (!cancelled && result) applyResult(result)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [article.id])

  const onRate = async (value: number) => {
    if (!interactive || busyRef.current) return
    if (userRating === value) {
      setMessage(STRINGS.ratingKept)
      return
    }
    busyRef.current = true
    setBusy(true)
    try {
      const updated = await rateArticle(article.id, value)
      applyResult(updated)
      if (updated.status === 'updated') setMessage(STRINGS.ratingUpdated)
      else if (updated.status === 'unchanged') setMessage(STRINGS.ratingKept)
      else setMessage(STRINGS.ratingThanks)
    } catch {
      setMessage(STRINGS.ratingError)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1"
        role="group"
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
            aria-pressed={userRating === value}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-primary-60">
        {count > 0
          ? STRINGS.ratingSummary(
              formatAverage(average),
              count.toLocaleString('fa-IR')
            )
          : STRINGS.rateArticle}
      </span>
      {userRating ? (
        <span className="text-sm text-primary-60">
          {STRINGS.yourRating(userRating)}
        </span>
      ) : null}
      {message && <span className="text-sm text-accent">{message}</span>}
    </div>
  )
}

export default StarRating
