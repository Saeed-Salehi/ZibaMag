import { getMediaURL } from './api'

type CoverSize = 'thumbnail' | 'small' | 'medium' | 'large'

export function getCoverUrl(
  cover?: TStrapiImage | null,
  size: CoverSize = 'medium'
): string | undefined {
  if (!cover) return undefined
  return cover.formats?.[size]?.url || cover.url || undefined
}

export function getCoverMediaUrl(
  cover?: TStrapiImage | null,
  size: CoverSize = 'medium'
): string | undefined {
  const url = getCoverUrl(cover, size)
  return url ? getMediaURL(url) : undefined
}

export function getCoverOgImages(cover?: TStrapiImage | null) {
  if (!cover?.formats) return []

  return Object.values(cover.formats)
    .filter((image): image is TStrapiImageFormat => !!image?.url)
    .map((image) => ({
      url: getMediaURL(image.url),
      width: image.width,
      height: image.height,
    }))
}

export function getCoverOgImageUrls(cover?: TStrapiImage | null): string[] {
  return getCoverOgImages(cover).map((image) => image.url)
}
