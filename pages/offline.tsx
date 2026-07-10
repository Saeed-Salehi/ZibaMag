import { Layout } from '@components/common/Layout'
import { STRINGS } from '@lib/strings'

const offline = () => {
  return (
    <Layout>
      <div className="text-center my-auto">
        <h4 className="my-1">{STRINGS.offline}</h4>
        <p>{STRINGS.offlineDescription}</p>
      </div>
    </Layout>
  )
}

export default offline
