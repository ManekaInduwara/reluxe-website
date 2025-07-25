export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    { name: 'paymentMethod', title: 'Payment Method', type: 'string' },
    { name: 'subtotal', type: 'number' },
    { name: 'shipping', type: 'number' },
    { name: 'total', type: 'number' },
    { name: 'items', type: 'array', of: [{ type: 'object', fields: [
      { name: 'productId', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'quantity', type: 'number' },
      { name: 'color', type: 'string' },
      { name: 'size', type: 'string' },
      { name: 'image', type: 'string' }
    ] }] },
    { name: 'customer', type: 'object', fields: [
      { name: 'firstName', type: 'string' },
      { name: 'lastName', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'phone', type: 'string' },
      { name: 'address', type: 'string' },
      { name: 'city', type: 'string' }
    ] },
    { name: 'bankSlipImage', type: 'image', title: 'Bank Slip Image' },
    { name: 'bankSlipNumber', type: 'string', title: 'Bank Slip Number' },
    {
  name: 'status',
  title: 'Order Status',
  type: 'string',
  options: {
    list: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  initialValue: 'pending',
}

  ]
}
