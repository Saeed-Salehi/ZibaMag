import React from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { getMediaURL } from '@lib/api'

const ImageRenderer = ({ src, alt }: { src: string; alt: string }) => {
  const srcUrl = getMediaURL(src)

  return (
    <figure className="mt-6">
      {/* Native img: markdown has no dimensions; next/image layout="fill" collapses without a sized parent. */}
      <img
        src={srcUrl}
        alt={alt || ''}
        className="article-image"
        style={{ borderRadius: 15 }}
      />
      {alt ? (
        <figcaption
          className="text-sm mt-4 text-primary-60"
          style={{ textAlign: 'center' }}
        >
          {alt}
        </figcaption>
      ) : null}
    </figure>
  )
}

const ParagraphRenderer = ({ children }: { children?: React.ReactNode }) => {
  const childArray = React.Children.toArray(children)
  const onlyChild = childArray.length === 1 ? childArray[0] : null

  // Unwrap sole image so <figure> is not nested inside <p>
  if (React.isValidElement(onlyChild) && onlyChild.type === ImageRenderer) {
    return onlyChild
  }

  return <p>{children}</p>
}

const TableRenderer = ({ children }: { children?: React.ReactNode }) => (
  <div className="markdown-table-wrap">
    <table>{children}</table>
  </div>
)

const Markdown = ({ content }: { content?: string }) => {
  return (
    <section className="markdown">
      <ReactMarkdown
        plugins={[gfm]}
        renderers={{
          image: ImageRenderer,
          paragraph: ParagraphRenderer,
          table: TableRenderer,
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </section>
  )
}

export default Markdown
