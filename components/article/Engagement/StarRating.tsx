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
  const [messageTone, setMessageTone] = useState<'ok' | 'error' | 'info'>('ok')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  const filled = hover || (userRating ?? starFill(average))
  const hasVotes = count > 0

  const applyResult = (result: TRatingResult) => {
    setAverage(averageRating(result))
    setCount(Math.max(0, Math.floor(Number(result.ratingCount) || 0)))
    if (typeof result.userRating === 'number') setUserRating(result.userRating)
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

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [message])

  const onRate = async (value: number) => {
    if (!interactive || busyRef.current) return
    if (userRating === value) {
      setMessageTone('info')
      setMessage(STRINGS.ratingKept)
      return
    }
    busyRef.current = true
    setBusy(true)
    try {
      const updated = await rateArticle(article.id, value)
      applyResult(updated)
      if (updated.status === 'updated') {
        setMessageTone('ok')
        setMessage(STRINGS.ratingUpdated)
      } else if (updated.status === 'unchanged') {
        setMessageTone('info')
        setMessage(STRINGS.ratingKept)
      } else {
        setMessageTone('ok')
        setMessage(STRINGS.ratingThanks)
      }
    } catch {
      setMessageTone('error')
      setMessage(STRINGS.ratingError)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <div className="rating-panel">
      <div className="rating-score" aria-hidden={!hasVotes}>
        <span className="rating-score-value">
          {hasVotes ? formatAverage(average) : '—'}
        </span>
        <span className="rating-score-label">{STRINGS.ratingOutOfFive}</span>
      </div>

      <div className="rating-body">
        <div
          className="rating-stars"
          role="group"
          aria-label={STRINGS.rateArticle}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const on = value <= filled
            const isUserPick = userRating === value
            return (
              <button
                key={value}
                type="button"
                disabled={!interactive || busy}
                className={cn(
                  'rating-star',
                  on && 'rating-star-on',
                  isUserPick && 'rating-star-picked',
                  interactive && 'rating-star-interactive'
                )}
                onMouseEnter={() => interactive && setHover(value)}
                onMouseLeave={() => setHover(0)}
                onFocus={() => interactive && setHover(value)}
                onBlur={() => setHover(0)}
                onClick={() => onRate(value)}
                aria-label={STRINGS.rateStars(value)}
                aria-pressed={userRating === value}
              >
                ★
              </button>
            )
          })}
        </div>

        <p className="rating-meta">
          {hasVotes
            ? STRINGS.ratingSummary(
                formatAverage(average),
                count.toLocaleString('fa-IR')
              )
            : STRINGS.ratingEmptyHint}
        </p>

        {userRating ? (
          <div className="rating-yours">
            <span className="rating-yours-stars" aria-hidden="true">
              {'★'.repeat(userRating)}
              <span className="rating-yours-empty">
                {'★'.repeat(5 - userRating)}
              </span>
            </span>
            <span>{STRINGS.yourRating(userRating)}</span>
          </div>
        ) : null}

        {message ? (
          <p
            className={cn(
              'rating-toast',
              messageTone === 'error' && 'rating-toast-error',
              messageTone === 'info' && 'rating-toast-info'
            )}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default StarRating
