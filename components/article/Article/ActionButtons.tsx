import AddToListButton from './AddToListButton'
import ShareButton from '@components/common/ShareButton'
import { STRINGS } from '@lib/strings'

const ActionButtons = ({ article }: { article: TArticle }) => {
  return (
    <ul className="flex justify-end mr-auto">
      <li>
        <AddToListButton article={article} />
      </li>
      <li>
        <ShareButton
          path={`/articles/${article.slug}`}
          title={article.title}
          message={STRINGS.checkThisArticle}
        />
      </li>
    </ul>
  )
}

export default ActionButtons
