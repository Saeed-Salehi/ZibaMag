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
        <p className="text-primary-60 mb-8">{STRINGS.noComments}</p>
      ) : (
        <ul className="space-y-6 mb-10">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-primary-05 rounded-xl p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <strong>{comment.authorName}</strong>
                <Date
                  date={comment.created_at as string}
                  className="text-sm text-primary-60"
                />
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm mb-1" htmlFor="comment-name">
            {STRINGS.yourName}
          </label>
          <input
            id="comment-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border border-primary-20 rounded-lg px-3 py-2 bg-secondary"
            required
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="comment-body">
            {STRINGS.yourComment}
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-primary-20 rounded-lg px-3 py-2 bg-secondary min-h-[120px]"
            required
            maxLength={2000}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-60"
        >
          {STRINGS.writeComment}
        </button>
        {status === 'ok' && (
          <p className="text-sm text-accent">{STRINGS.commentSuccess}</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-accent">{STRINGS.commentError}</p>
        )}
      </form>
    </section>
  )
}

export default CommentSection
