import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Product Description',
      type: 'text',
    }),
 // In your product schema
defineField({
  name: 'categories',
  title: 'Product Categories',
  type: 'array',
  of: [{
    type: 'reference',
    to: [{ type: 'category' }],
    options: {
      filter: '!defined(parentCategory)', // Only show top-level categories
    }
  }],
  validation: Rule => Rule.unique() // Prevent duplicate category references
}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImages',
      title: 'Main Product Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1).max(6),
    }),
    defineField({
      name: 'price',
      title: 'Base Price',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'discount',
      title: 'Discount (%)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'availableQuantity',
      title: 'Total Available Quantity',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
defineField({
  name: 'rating',
  title: 'Average Rating',
  type: 'number',
  readOnly: true,
  initialValue: 0,
}),

    defineField({
      name: 'colors',
      title: 'Color Variants',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'colorVariant',
          title: 'Color Variant',
          fields: [
            { name: 'name', title: 'Color Name', type: 'string' },
            { name: 'color', title: 'Color Picker', type: 'color' },
            { name: 'amount', title: 'Color-specific Price (optional)', type: 'number' },
            { name: 'quantity', title: 'Quantity for this Color', type: 'number' },
            { name: 'about', title: 'About This Color', type: 'text' },
            {
              name: 'images',
              title: 'Images for this Color',
              type: 'array',
              of: [{ type: 'image' }],
              options: { layout:'grid', hotspot: true },
            },
            {
              name: 'sizes',
              title: 'Size Variants',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'sizeVariant',
                  title: 'Size Variant',
                  fields: [
                    { name: 'size', title: 'Size', type: 'string' },
                    { name: 'quantity', title: 'Quantity', type: 'number' },
                    { name: 'amount', title: 'Price for Size (optional)', type: 'number' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'sizeGuide',
      title: 'Size Guide',
      type: 'object',
      fields: [
        defineField({
          name: 'active',
          title: 'Enable Size Guide',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Guide Title',
          type: 'string',
          initialValue: 'Size Guide',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
        defineField({
          name: 'measurementImage',
          title: 'Measurement Diagram',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'chartType',
          title: 'Chart Type',
          type: 'string',
          options: {
            list: [
              { title: 'Standard Sizes (XS-XXL)', value: 'standard' },
              { title: 'Numerical Sizes (28-42)', value: 'numerical' },
              { title: 'Alpha Sizes (S, M, L)', value: 'alpha' },
              { title: 'Custom Sizes', value: 'custom' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'standard',
        }),
        defineField({
          name: 'sizeChart',
          title: 'Size Chart',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'region',
                  title: 'Body Region',
                  type: 'string',
                  description: 'e.g., Chest, Waist, Hips',
                  validation: Rule => Rule.required(),
                }),
                defineField({
                  name: 'measurement',
                  title: 'How to Measure',
                  type: 'text',
                  description: 'Instructions for taking this measurement',
                }),
                defineField({
                  name: 'values',
                  title: 'Size Values',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'XS',
                      type: 'string',
                      title: 'XS',
                    }),
                    defineField({
                      name: 'S',
                      type: 'string',
                      title: 'S',
                    }),
                    defineField({
                      name: 'M',
                      type: 'string',
                      title: 'M',
                    }),
                    defineField({
                      name: 'L',
                      type: 'string',
                      title: 'L',
                    }),
                    defineField({
                      name: 'XL',
                      type: 'string',
                      title: 'XL',
                    }),
                    defineField({
                      name: 'XXL',
                      type: 'string',
                      title: 'XXL',
                    }),
                    defineField({
                      name: 'customSizes',
                      title: 'Custom Sizes',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            { name: 'label', type: 'string', title: 'Size Label' },
                            { name: 'value', type: 'string', title: 'Measurement' }
                          ]
                        }
                      ],
                      hidden: ({ parent }) => parent?.chartType !== 'custom',
                    }),
                  ],
                }),
              ],
              preview: {
                select: {
                  title: 'region',
                  subtitle: 'measurement',
                },
                prepare({ title, subtitle }) {
                  return {
                    title: title || 'Untitled region',
                    subtitle: subtitle ? subtitle.slice(0, 50) + '...' : 'No measurement instructions',
                  };
                },
              },
            },
          ],
        }),
        defineField({
          name: 'fitNotes',
          title: 'Fit Notes',
          type: 'text',
          description: 'e.g., "Runs small", "True to size"',
        }),
        defineField({
          name: 'disclaimer',
          title: 'Disclaimer',
          type: 'text',
          description: 'Any sizing disclaimers or notes',
        }),
      ],
    }),
  ],
})