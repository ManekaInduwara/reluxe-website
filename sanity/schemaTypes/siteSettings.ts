export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'maintenanceMode',
      title: 'Maintenance Mode',
      type: 'boolean',
      initialValue: false,
      description: 'When enabled, shows maintenance page to all visitors except admins'
    },
    {
      name: 'maintenanceMessage',
      title: 'Maintenance Message',
      type: 'text',
      rows: 3,
      description: 'Optional message to display during maintenance'
    },
    {
      name: 'estimatedEndTime',
      title: 'Estimated End Time',
      type: 'datetime',
      description: 'When maintenance is expected to complete'
    }
  ],
  preview: {
    select: {
      title: 'maintenanceMode',
      subtitle: 'maintenanceMessage'
    },
    prepare({ title, subtitle }) {
      return {
        title: `Maintenance Mode: ${title ? 'ON' : 'OFF'}`,
        subtitle: subtitle || 'No message set'
      }
    }
  }
}