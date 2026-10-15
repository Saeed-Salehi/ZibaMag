import { FormEvent, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import s from './Header.module.css'
import { useRouter } from 'next/router'
import Close from '@components/icons/Close'
import Search from '@components/icons/Search'
import Bookmark from '@components/icons/Bookmark'
import Menu from '@components/icons/Menu'
import { Button } from '@components/ui/Button'
import { useIsMobile } from '@lib/hooks/use-media-queries'
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'
import { SITE_LOGO, SITE_LOGO_LIGHT, SITE_NAME } from '@lib/constants'
import { STRINGS } from '@lib/strings'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  categories?: TCategory[]
}

const Header = ({ categories = [] }: Props) => {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [query, setQuery] = useState('')
  const isMobile = useIsMobile()
  const searchRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchRef.current && isMobile) {
      if (showSearch) {
        disableBodyScroll(searchRef.current)
        inputRef.current?.focus()
      } else {
        enableBodyScroll(searchRef.current)
      }
    }
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [showSearch, isMobile])

  useEffect(() => {
    if (!menuRef.current) return
    if (showMenu) {
      disableBodyScroll(menuRef.current)
    } else {
      enableBodyScroll(menuRef.current)
    }
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [showMenu])

  useEffect(() => {
    const close = () => setShowMenu(false)
    router.events.on('routeChangeStart', close)
    return () => router.events.off('routeChangeStart', close)
  }, [router.events])

  const goSearch = (value: string) => {
    const q = value.trim()
    setShowSearch(false)
    router.push(
      {
        pathname: '/search',
        query: q ? { q } : {},
      },
      undefined,
      { shallow: false }
    )
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    goSearch(query)
  }

  const menuLinkClass = (active: boolean) =>
    cn(s.menuLink, active && s.menuLinkActive)

  return (
    <header ref={searchRef} className={s.header}>
      <div className={s.inner}>
        <div className={s.left}>
          {categories.length > 0 && (
            <Button
              className={cn(s.iconBtn, s.menuBtn)}
              onClick={() => setShowMenu(true)}
              ariaLabel={STRINGS.openMenu}
            >
              <Menu width="22" height="22" />
            </Button>
          )}
          <Link href="/">
            <a className={s.brand} aria-label={SITE_NAME}>
              <span className={s.logoLight}>
                <Image
                  src={SITE_LOGO_LIGHT}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </span>
              <span className={s.logoDark} aria-hidden="true">
                <Image
                  src={SITE_LOGO}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </span>
              <span className={s.brandName}>{SITE_NAME}</span>
            </a>
          </Link>
        </div>

        <form className={s.desktopSearch} onSubmit={onSubmit} role="search">
          <span className={s.searchIcon} aria-hidden="true">
            <Search width="18" height="18" />
          </span>
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={STRINGS.searchPlaceholder}
            className={s.searchInput}
            aria-label={STRINGS.search}
          />
        </form>

        <div className={s.actions}>
          <Button
            className={s.iconBtn}
            onClick={() => setShowSearch(true)}
            ariaLabel={STRINGS.search}
          >
            <Search width="20" height="20" />
          </Button>
          <Button
            href="/lists"
            className={s.iconBtn}
            ariaLabel={STRINGS.myBookmarks}
          >
            <Bookmark width="20" height="20" />
          </Button>
        </div>
      </div>

      <div
        className={cn(s.searchOverlay, showSearch ? s.searchOpen : undefined)}
      >
        <form className={s.mobileSearch} onSubmit={onSubmit} role="search">
          <span className={s.searchIcon} aria-hidden="true">
            <Search width="18" height="18" />
          </span>
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={STRINGS.searchPlaceholder}
            className={s.searchInput}
            aria-label={STRINGS.search}
          />
          <Button
            onClick={() => setShowSearch(false)}
            ariaLabel={STRINGS.closeSearch}
            className={s.iconBtn}
          >
            <Close width="20" height="20" />
          </Button>
        </form>
      </div>

      {categories.length > 0 && (
        <div
          className={cn(s.menuDrawer, showMenu && s.menuDrawerOpen)}
          aria-hidden={!showMenu}
        >
          <button
            type="button"
            className={s.menuBackdrop}
            aria-label={STRINGS.closeMenu}
            onClick={() => setShowMenu(false)}
          />
          <div
            ref={menuRef}
            className={s.menuPanel}
            role="dialog"
            aria-modal="true"
            aria-label={STRINGS.menu}
          >
            <div className={s.menuHeader}>
              <p className={s.menuTitle}>{STRINGS.sections}</p>
              <Button
                className={s.iconBtn}
                onClick={() => setShowMenu(false)}
                ariaLabel={STRINGS.closeMenu}
              >
                <Close width="20" height="20" />
              </Button>
            </div>
            <nav className={s.menuNav}>
              <Link href="/">
                <a className={menuLinkClass(router.pathname === '/')}>
                  {STRINGS.home}
                </a>
              </Link>
              {categories.map((category) => (
                <Link href={`/${category.slug}`} key={category.slug}>
                  <a
                    className={menuLinkClass(
                      router.query.slug === category.slug
                    )}
                  >
                    {category.title}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
