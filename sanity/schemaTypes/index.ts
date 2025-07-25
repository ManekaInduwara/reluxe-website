import { type SchemaTypeDefinition } from 'sanity'
import hero from './hero'
import productType from './productType'
import category from './category'
import order from './order'
import email from './email'
import ourMissionImage from './ourMissionImage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ productType,hero, category , order , email , ourMissionImage]
}
