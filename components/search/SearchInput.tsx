import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import cn from 'classnames'
import Search from '@components/icons/Search'
import { filterQueries } from '@lib/search'
import { STRINGS } from '@lib/strings'

const SearchInput = ({ categories }: { categories: TCategory[] }) => {
  const router = useRouter()
  const { q, category, sort } = router.query
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    setValue(typeof q === 'string' ? q : '')
  }, [router.isReady, q])

  const pushQuery = (next: {
    q?: string | string[]
    category?: string | string[]
    sort?: string | string[]
  }) => {
    router.push(
      {
        pathname: '/search',
        query: filterQueries(next),
      },
      undefined,
      { shallow: true }
    )
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    pushQuery({ q: value.trim(), category, sort })
  }

  return (
    <section className="search-panel">
      <form className="search-box" onSubmit={onSubmit} role="search">
        <span className="search-box-icon" aria-hidden="true">
          <Search width="18" height="18" />
        </span>
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={STRINGS.searchPlaceholder}
          aria-label={STRINGS.search}
          className="search-box-input"
        />
        <button type="submit" className="magazine-btn magazine-btn-ghost">
          {STRINGS.search}
        </button>
      </form>

      <div className="filter-row" aria-label={STRINGS.sortBy}>
        <button
          type="button"
          className={cn(
            'filter-chip',
            (!sort || sort === 'desc') && 'filter-chip-active'
          )}
          onClick={() => pushQuery({ q, category, sort: 'desc' })}
          aria-pressed={!sort || sort === 'desc'}
        >
          {STRINGS.newest}
        </button>
        <button
          type="button"
          className={cn('filter-chip', sort === 'asc' && 'filter-chip-active')}
          onClick={() => pushQuery({ q, category, sort: 'asc' })}
          aria-pressed={sort === 'asc'}
        >
          {STRINGS.oldest}
        </button>
      </div>

      <div className="filter-row" aria-label={STRINGS.filterBy}>
        <button
          type="button"
          className={cn('filter-chip', !category && 'filter-chip-active')}
          onClick={() => pushQuery({ q, sort })}
          aria-pressed={!category}
        >
          {STRINGS.allCategories}
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item.slug}
            className={cn(
              'filter-chip',
              category === item.slug && 'filter-chip-active'
            )}
            onClick={() => pushQuery({ q, category: item.slug, sort })}
            aria-pressed={category === item.slug}
          >
            {item.title}
          </button>
        ))}
      </div>
    </section>
  )
}

export default SearchInput
