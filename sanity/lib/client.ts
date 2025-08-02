import { createClient } from '@sanity/client';

import { apiVersion, dataset, projectId,token } from '../env'

export const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
 useCdn: false, // Important for mutations
})
