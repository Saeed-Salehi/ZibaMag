import { InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { ArticlesList } from '@components/article'
import { Layout } from '@components/common/Layout'
import { fetchAPI, getNavigation } from '@lib/api'
import { sortByNewest, sortByRating, sortByViews } from '@lib/articles'
import { getCanonicalUrl, REVALIDATE_SECONDS } from '@lib/seo'
import { STRINGS } from '@lib/strings'
import { SITE_NAME } from '@lib/constants'

const PAGE_SIZE = 12

type SortKey = 'newest' | 'oldest' | 'views' | 'rating'

async function safeFetchTags(): Promise<TTag[]> {
  try {
    return await fetchAPI('/tags?_limit=-1')
  } catch {
    return []
  }
}

export async function getStaticProps() {
  const [articles, categories, tags, navigation] = await Promise.all([
    fetchAPI('/articles?_sort=published_at:DESC&_limit=-1'),
    fetchAPI('/categories'),
    safeFetchTags(),
    getNavigation(),
  ])

  return {
    props: {
      articles: articles as TArticle[],
      categories: categories as TCategory[],
      tags: tags as TTag[],
      navigation: navigation as TNavigation,
    },
    revalidate: REVALIDATE_SECONDS,
  }
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('filter-chip', active && 'filter-chip-active')}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function AllArticlesPage({
  articles,
  categories,
  tags,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!router.isReady) return
    const nextCategory =
      typeof router.query.category === 'string' ? router.query.category : ''
    setCategory(nextCategory)
    setVisible(PAGE_SIZE)
  }, [router.isReady, router.query.category])

  const filtered = useMemo(() => {
    let list = articles
    if (category) {
      list = list.filter((item) => item.category?.slug === category)
    }
    if (tag) {
      list = list.filter((item) =>
        (item.tags || []).some((entry) => entry.slug === tag)
      )
    }
    if (sort === 'newest') list = sortByNewest(list)
    else if (sort === 'oldest') list = [...sortByNewest(list)].reverse()
    else if (sort === 'views') list = sortByViews(list)
    else list = sortByRating(list)
    return list
  }, [articles, category, tag, sort])

  const shown = filtered.slice(0, visible)
  const pageTitle = `${STRINGS.allArticles} | ${SITE_NAME}`

  return (
    <Layout navigation={navigation}>
      <NextSeo
        title={pageTitle}
        description={STRINGS.allArticlesDescription}
        canonical={getCanonicalUrl('/articles')}
        openGraph={{
          title: pageTitle,
          description: STRINGS.allArticlesDescription,
          url: getCanonicalUrl('/articles'),
        }}
      />

      <header className="archive-hero">
        <h1>{STRINGS.allArticles}</h1>
        <p>{STRINGS.allArticlesDescription}</p>
        <p className="archive-count">{STRINGS.articleCount(filtered.length)}</p>
      </header>

      <section className="archive-toolbar" aria-label={STRINGS.filterBy}>
        <div className="filter-row">
          <span className="filter-label">{STRINGS.filterBy}</span>
          <FilterChip
            active={!category}
            onClick={() => {
              setCategory('')
              setVisible(PAGE_SIZE)
            }}
          >
            {STRINGS.allCategories}
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.id}
              active={category === item.slug}
              onClick={() => {
                setCategory(item.slug)
                setVisible(PAGE_SIZE)
              }}
            >
              {item.title}
            </FilterChip>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="filter-row">
            <span className="filter-label">{STRINGS.tags}</span>
            <FilterChip
              active={!tag}
              onClick={() => {
                setTag('')
                setVisible(PAGE_SIZE)
              }}
            >
              {STRINGS.allTags}
            </FilterChip>
            {tags.map((item) => (
              <FilterChip
                key={item.id}
                active={tag === item.slug}
                onClick={() => {
                  setTag(item.slug)
                  setVisible(PAGE_SIZE)
                }}
              >
                #{item.title}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="filter-row">
          <span className="filter-label">{STRINGS.sortBy}</span>
          {([
            ['newest', STRINGS.newest],
            ['oldest', STRINGS.oldest],
            ['views', STRINGS.mostViewed],
            ['rating', STRINGS.highestRated],
          ] as [SortKey, string][]).map(([key, label]) => (
            <FilterChip
              key={key}
              active={sort === key}
              onClick={() => setSort(key)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </section>

      {shown.length ? (
        <ArticlesList articles={shown} title="" className="mt-0" />
      ) : (
        <p className="text-center text-primary-60 py-16">
          {STRINGS.noArticles}
        </p>
      )}

      {visible < filtered.length && (
        <div className="text-center mt-12">
          <button
            type="button"
            className="magazine-btn magazine-btn-ghost"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
          >
            {STRINGS.loadMore}
          </button>
        </div>
      )}

      {tags.length > 0 && (
        <nav className="tag-cloud" aria-label={STRINGS.tags}>
          {tags.map((item) => (
            <Link key={item.id} href={`/tags/${item.slug}`}>
              <a
                className={cn(
                  'tag-pill',
                  tag === item.slug && 'tag-pill-active'
                )}
              >
                #{item.title}
              </a>
            </Link>
          ))}
        </nav>
      )}
    </Layout>
  )
}

export default AllArticlesPage
