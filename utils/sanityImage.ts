// utils/sanityImage.ts
type SanityImageSource = {
  asset?: {
    url?: string
  }
} | {
  _id: string;
  url: string;
}

export const getSanityImageUrl = (source: SanityImageSource | string | null): string | null => {
  if (!source) return null
  if (typeof source === 'string') return source.trim() || null
  
  // Handle direct url property (e.g., { _id: string, url: string })
  if ('url' in source && source.url) return source.url
  
  // Handle asset.url structure
  if ('asset' in source && source.asset?.url) return source.asset.url
  
  return null
}

export const getFirstValidImage = (images: any[] | undefined): SanityImageSource | null => {
  if (!images || !Array.isArray(images)) return null
  return images.find(img => getSanityImageUrl(img)) || null
}