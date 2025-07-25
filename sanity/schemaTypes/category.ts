import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
      description: 'E.g., "Oversized Tees", "Denim Jeans", "Accessories"'
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .slice(0, 96)
      },
      validation: (Rule) => Rule.required()
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Category description for SEO and listings'
    }),

    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required()
        })
      ]
    }),

    defineField({
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Leave empty for top-level categories'
    }),

    defineField({
      name: 'featured',
      title: 'Featured Category',
      type: 'boolean',
      initialValue: false,
      description: 'Show this category in featured sections'
    }),

    defineField({
      name: 'displayOptions',
      title: 'Display Options',
      type: 'object',
      fields: [
        defineField({
          name: 'layout',
          title: 'Layout Style',
          type: 'string',
          options: {
            list: [
              { title: 'Grid', value: 'grid' },
              { title: 'List', value: 'list' },
              { title: 'Carousel', value: 'carousel' }
            ],
            layout: 'radio'
          },
          initialValue: 'grid'
        }),
        defineField({
          name: 'showFilters',
          title: 'Show Filters',
          type: 'boolean',
          initialValue: true
        }),
        defineField({
          name: 'defaultSort',
          title: 'Default Sort',
          type: 'string',
          options: {
            list: [
              { title: 'Newest', value: 'newest' },
              { title: 'Price: Low to High', value: 'priceAsc' },
              { title: 'Price: High to Low', value: 'priceDesc' },
              { title: 'Best Selling', value: 'popular' }
            ]
          },
          initialValue: 'newest'
        })
      ]
    }),

    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60)
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
          validation: (Rule) => Rule.max(160)
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: { layout: 'tags' }
        })
      ]
    })
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'image'
    },
    prepare(selection) {
      const { title, subtitle, media } = selection
      return {
        title,
        subtitle: `/category/${subtitle}`,
        media
      }
    }
  }
})