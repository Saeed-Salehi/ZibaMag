import { FormEvent, useState } from 'react'
import { submitComment } from '@lib/api'
import { STRINGS } from '@lib/strings'
import { Date } from '@components/ui/Date'

type Props = {
  articleId: number
  comments: TComment[]
}

const CommentSection = ({ articleId, comments }: Props) => {
  const [authorName, setAuthorName] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!authorName.trim() || !body.trim() || busy) return
    setBusy(true)
    try {
      await submitComment({
        article: articleId,
        authorName: authorName.trim(),
        body: body.trim(),
      })
      setAuthorName('')
      setBody('')
      setStatus('ok')
    } catch {
      setStatus('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="article-comments">
      <h2 className="article-engagement-title">{STRINGS.comments}</h2>

      {comments.length === 0 ? (
        <p className="comment-empty">{STRINGS.noComments}</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-item-meta">
                <strong>{comment.authorName}</strong>
                <Date
                  date={comment.created_at as string}
                  className="text-sm text-primary-60"
                />
              </div>
              <p className="comment-item-body">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="comment-form">
        <div>
          <label className="comment-label" htmlFor="comment-name">
            {STRINGS.yourName}
          </label>
          <input
            id="comment-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="comment-input"
            required
            maxLength={80}
          />
        </div>
        <div>
          <label className="comment-label" htmlFor="comment-body">
            {STRINGS.yourComment}
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="comment-input comment-textarea"
            required
            maxLength={2000}
          />
        </div>
        <button type="submit" disabled={busy} className="comment-submit">
          {STRINGS.writeComment}
        </button>
        {status === 'ok' && (
          <p className="rating-toast" role="status">
            {STRINGS.commentSuccess}
          </p>
        )}
        {status === 'error' && (
          <p className="rating-toast rating-toast-error" role="status">
            {STRINGS.commentError}
          </p>
        )}
      </form>
    </section>
  )
}

export default CommentSection
