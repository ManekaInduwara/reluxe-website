'use client'

import { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { Loader2, Download, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { NewsletterSender } from '../Components/NewsletterSender'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4" />,
  processing: <Loader2 className="h-4 w-4 animate-spin" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}




export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  

  const fetchOrders = async () => {
    setLoading(true)
    const data = await client.fetch(`*[_type == "order"] | order(_createdAt desc)`)
    setOrders(data)
    setLoading(false)
  }

  const downloadAllOrders = () => {
    window.open('/api/admin/orders-report', '_blank')
  }

  const downloadSingleOrder = (id: string) => {
    window.open(`/api/admin/order-report/${id}`, '_blank')
  }

  const handleSendInvoice = async (orderId: string) => {
  try {
    const res = await fetch('/api/admin/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    if (!res.ok) throw new Error('Failed to send invoice')
    toast.success('Invoice sent successfully!')
  } catch (err) {
    console.error(err)
    toast.error('Failed to send invoice')
  }
}


  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      await client.patch(orderId).set({ status: newStatus }).commit()
      await fetchOrders()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="container mx-auto py-8 bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management Dashboard</h1>
        <Button onClick={downloadAllOrders} className="gap-2 bg-green-600">
          <Download className="h-4 w-4" />
          Export All Orders
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No orders found
              </CardContent>
            </Card>
          ) : (
            orders.map(order => {
              const itemCount = order.items?.reduce((t: number, item: any) => t + item.quantity, 0)

              return (
                <Card key={order._id} className="overflow-hidden bg-black text-white">
                  <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order._createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">LKR {order.total.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                        </div>
                        <Button size="sm" onClick={() => downloadSingleOrder(order._id)} className="gap-1 bg-red-500">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
   <Button
  size="sm"
  variant="secondary"
  className="gap-1 bg-blue-600 text-white"
  onClick={() => handleSendInvoice(order._id)}
>
  <Mail className="h-3 w-3" />
  Send Invoice
</Button>

  <Button size="sm" variant="ghost" onClick={() => toggleOrderExpansion(order._id)}>
                          {expandedOrder === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedOrder === order._id && (
                    <CardContent className="p-4 pt-0 bg-gray-950 text-white">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Customer Information</h3>
                            <div className="text-sm space-y-1">
                              <div>{order.customer.firstName} {order.customer.lastName}</div>
                              <div>{order.customer.email}</div>
                              {order.customer.phone && <div>{order.customer.phone}</div>}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Payment Method</h3>
                            <div className="text-sm capitalize">{order.paymentMethod}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Shipping Address</h3>
                          <div className="text-sm whitespace-pre-line">{order.customer.address}</div>
                          <div className="text-sm whitespace-pre-line">{order.customer.city}</div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Order Status</h3>
                            <div className="flex items-center gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order._id, value)}
                                disabled={updatingOrderId === order._id}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map(status => (
                                    <SelectItem key={status} value={status}>
                                      <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`} />
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {updatingOrderId === order._id && <Loader2 className="animate-spin h-4 w-4" />}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Order Items</h3>
                            <div className="space-y-3">
                              {order.items?.map((item: any) => (
                                <div key={`${item.productId}-${item.color}-${item.size}`} className="p-2 bg-black/20 rounded-md text-sm">
                                  <div className="font-semibold">{item.title}</div>
                                  <div className="text-gray-400">
                                    {item.color && <>Color: {item.color}<br /></>}
                                    {item.size && <>Size: {item.size}<br /></>}
                                  </div>
                                  <div>Quantity: {item.quantity}</div>
                                  <div className="font-medium">LKR {(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>
      )}
      <NewsletterSender />
    </div>
  )
}
