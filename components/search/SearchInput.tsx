import { useRouter } from 'next/router'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'
import s from './SearchInput.module.css'
import Close from '@components/icons/Close'
import Filters from '@components/icons/Filters'
import Link from 'next/link'
import { filterQueries } from '@lib/search'
import { Button } from '@components/ui/Button'
import { STRINGS } from '@lib/strings'
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'

const SearchInput = ({ categories }: { categories: TCategory[] }) => {
  const [showFilters, setShowFilters] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { q, category, sort } = router.query

  useEffect(() => {
    if (searchRef.current) {
      if (showFilters) {
        disableBodyScroll(searchRef.current!)
      } else {
        enableBodyScroll(searchRef.current!)
      }
    }
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [showFilters])

  useEffect(() => {
    if (!showFilters) return

    const onOutsideClick = (e: any) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('click', onOutsideClick)
    document.addEventListener('touchstart', onOutsideClick)
    return () => {
      document.removeEventListener('click', onOutsideClick)
      document.removeEventListener('touchstart', onOutsideClick)
    }
  }, [showFilters])

  const SearchFilters = () => {
    return (
      <div className="absolute z-20 bg-secondary left-0 right-0 px-2 pt-2 pb-6 border-b">
        <p className={s.filterHeading}>{STRINGS.sortBy}</p>
        <ul>
          <Link
            href={{
              pathname: '/search',
              query: filterQueries({ q, category, sort: 'asc' }),
            }}
          >
            <li
              className={cn(s.filter, {
                [s.filterActive]: !sort || sort === 'asc',
              })}
            >
              {STRINGS.newest}
            </li>
          </Link>
          <Link
            href={{
              pathname: '/search',
              query: filterQueries({ q, category, sort: 'desc' }),
            }}
          >
            <li
              className={cn(s.filter, {
                [s.filterActive]: sort === 'desc',
              })}
            >
              {STRINGS.oldest}
            </li>
          </Link>
        </ul>
        <p className={s.filterHeading}>{STRINGS.filterBy}</p>
        <ul>
          <Link
            href={{
              pathname: '/search',
              query: { q, sort },
            }}
          >
            <li
              className={cn(s.filter, {
                [s.filterActive]: !category,
              })}
            >
              {STRINGS.allCategories}
            </li>
          </Link>
          {categories.map((c) => (
            <Link
              href={{
                pathname: '/search',
                query: filterQueries({ q, category: c.slug, sort }),
              }}
              key={c.slug}
            >
              <li
                className={cn(s.filter, {
                  [s.filterActive]: category === c.slug,
                })}
              >
                {c.title}
              </li>
            </Link>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={searchRef} className="sticky bg-secondary top-0 py-4 z-20 mb-6">
      <label
        htmlFor="search"
        className="flex border-b w-full py-2 px-1 focus-within:border-primary"
      >
        <input
          type="search"
          inputMode="search"
          name="search"
          id="search"
          defaultValue={router.query.q}
          placeholder={STRINGS.searchPlaceholder}
          className="bg-transparent outline-none w-full pr-2 pl-4 search-btn-none search-input"
          onKeyUp={(e) => {
            e.preventDefault()
            if (e.key === 'Enter') {
              const q = e.currentTarget.value
              router.push(
                {
                  pathname: '/search',
                  query: q ? { q } : {},
                },
                undefined,
                { shallow: true }
              )
            }
          }}
        />

        <Button
          className={s.searchButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filters />
        </Button>

        <Button className={s.searchButton} onClick={() => router.push('/')}>
          <Close />
        </Button>
      </label>
      {showFilters && <SearchFilters />}
    </div>
  )
}

export default SearchInput
