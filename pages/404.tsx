import { Layout } from '@components/common/Layout'
import { STRINGS } from '@lib/strings'

export default function Custom404() {
  return (
    <Layout>
      <div className="text-center my-auto">
        <h4 className="my-1">{STRINGS.pageNotFound}</h4>
        <p>{STRINGS.pageNotFoundDescription}</p>
      </div>
    </Layout>
  )
}
