import { type SchemaTypeDefinition } from 'sanity'
import hero from './hero'
import productType from './productType'
import category from './category'
import order from './order'
import email from './email'
import ourMissionImage from './ourMissionImage'
import siteSettings from './siteSettings'
import rating, { ratingSchema } from './rating'
import comment from './comment'
import feedbackSchema from './rating'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ productType,hero, category , order , email , ourMissionImage , siteSettings , ratingSchema, feedbackSchema]
}
