// rating.js
export const ratingSchema = {
  name: 'rating',
  title: 'Product Rating',
  type: 'document',
  fields: [
    {
      name: 'productId',
      title: 'Product ID',
      type: 'string',
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'value',
      title: 'Rating Value',
      type: 'number',
      validation: (Rule: any) => Rule.min(1).max(5).integer().required(),
    },
  ],
};

// feedback.js
interface FeedbackField {
    name: string;
    title: string;
    type: string;
    validation?: (Rule: any) => any;
}

interface FeedbackSchema {
    name: string;
    title: string;
    type: string;
    fields: FeedbackField[];
}

const feedbackSchema: FeedbackSchema = {
    name: 'feedback',
    title: 'Product Feedback',
    type: 'document',
    fields: [
        {
            name: 'productId',
            title: 'Product ID',
            type: 'string',
        },
        {
            name: 'userId',
            title: 'User ID',
            type: 'string',
        },
        {
            name: 'userName',
            title: 'User Name',
            type: 'string',
              validation: Rule => Rule.required(),
        },
        {
            name: 'userImage',
            title: 'User Image',
            type: 'url',
        },
        {
            name: 'comment',
            title: 'Comment',
            type: 'text',
            validation: (Rule: any) => Rule.required().min(10),
        },
        {
            name: 'rating',
            title: 'Rating',
            type: 'number',
            validation: (Rule: any) => Rule.min(1).max(5).integer().required(),
        },
    ],
};

export default feedbackSchema;