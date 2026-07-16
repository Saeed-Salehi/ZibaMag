import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { useHideOnScroll } from '@lib/hooks/use-hide-on-scroll'
import { STRINGS } from '@lib/strings'

const Nav = ({ categories }: { categories: TCategory[] }) => {
  const router = useRouter()
  const { isHidden } = useHideOnScroll()
  return (
    <nav
      aria-label="Categories Nav"
      className={cn(
        'overflow-x-scroll sticky flex whitespace-nowrap px-4 top-14 z-10 bg-secondary scrollbar-none transform transition-transform duration-300',
        'md:justify-center',
        isHidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <Link href={`/`}>
        <a
          className={cn(
            'px-6 py-2 text-xs font-semibold text-primary-90',
            router.pathname === '/' && 'border-b-2 border-primary'
          )}
        >
          {STRINGS.home}
        </a>
      </Link>
      {categories.map((category) => (
        <Link href={`/${category.slug}`} key={category.slug}>
          <a
            className={cn(
              'py-2 px-4 text-xs font-semibold text-primary-90',
              router.query.slug === category.slug && 'border-b-2 border-primary'
            )}
          >
            {category.title}
          </a>
        </Link>
      ))}
    </nav>
  )
}

export default Nav
