// utils/sanityImage.ts
type SanityImageSource = {
  asset?: {
    url?: string
  }
}

export const getSanityImageUrl = (source: SanityImageSource | string | null): string | null => {
  if (!source) return null
  if (typeof source === 'string') return source.trim() || null
  if (source.asset?.url) return source.asset.url
  return null
}

export const getFirstValidImage = (images: any[] | undefined): SanityImageSource | null => {
  if (!images || !Array.isArray(images)) return null
  return images.find(img => getSanityImageUrl(img)) || null
}