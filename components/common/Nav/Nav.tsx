import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { useHideOnScroll } from '@lib/hooks/use-hide-on-scroll'
import { STRINGS } from '@lib/strings'

const Nav = ({ categories }: { categories: TCategory[] }) => {
  const router = useRouter()
  const { isHidden } = useHideOnScroll()

  const linkClass = (active: boolean) =>
    cn('nav-link', active && 'nav-link-active')

  return (
    <nav
      aria-label="Categories Nav"
      className={cn(
        'site-nav',
        'site-nav-desktop',
        isHidden && 'site-nav-hidden'
      )}
    >
      <div className="site-nav-inner">
        <Link href="/">
          <a className={linkClass(router.pathname === '/')}>{STRINGS.home}</a>
        </Link>
        {categories.map((category) => (
          <Link href={`/${category.slug}`} key={category.slug}>
            <a className={linkClass(router.query.slug === category.slug)}>
              {category.title}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Nav
