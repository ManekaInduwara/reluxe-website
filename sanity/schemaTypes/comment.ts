export default {
  name: 'comment',
  type: 'document',
  title: 'Comment',
  fields: [
    { name: 'feedbackId', type: 'string', title: 'Feedback ID' },
    { name: 'userId', type: 'string', title: 'User ID' },
    { name: 'text', type: 'text', title: 'Comment Text' },
    {
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      initialValue: () => new Date().toISOString(),
    },
  ],
}
