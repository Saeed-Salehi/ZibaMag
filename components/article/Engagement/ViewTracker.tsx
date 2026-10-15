import { useEffect } from 'react'
import { recordArticleView } from '@lib/api'

const ViewTracker = ({ articleId }: { articleId: number }) => {
  useEffect(() => {
    recordArticleView(articleId).catch(() => undefined)
  }, [articleId])

  return null
}

export default ViewTracker
