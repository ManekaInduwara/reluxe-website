export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-07-03'

export const dataset = process.env.NODE_ENV === 'production' 
  ? assertValue(
      process.env.NEXT_PUBLIC_SANITY_DATASET,
      'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
    )
  : process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NODE_ENV === 'production'
  ? assertValue(
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
    )
  : process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id'

export const token = process.env.NODE_ENV === 'production'
  ? assertValue(
      process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
      'Missing environment variable: NEXT_PUBLIC_SANITY_API_TOKEN'
    )
  : process.env.NEXT_PUBLIC_SANITY_API_TOKEN || 'dummy-token'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
