export default {
  name: 'newsletterEmail',
  title: 'Newsletter Emails',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
    },
    {
      name: 'createdAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
    },
  ],
}
