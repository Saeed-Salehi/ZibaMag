import Link from 'next/link'
import { STRINGS } from '@lib/strings'

const ExitPreviewButton = () => {
  return (
    <Link href="/api/exit-preview">
      <p className="fixed bottom-4 text-sm rounded-lg p-3 left-6 right-6 bg-accent text-secondary font-bold z-20 text-center cursor-pointer transform scale-100 transition-transform hover:scale-105 lg:w-1/2 lg:mx-auto">
        {STRINGS.exitPreview}
      </p>
    </Link>
  )
}

export default ExitPreviewButton
