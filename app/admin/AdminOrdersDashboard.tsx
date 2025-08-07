'use client'

import { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { Loader2, Download, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle, Mail, Trash2, Package, CreditCard, User, Star, Crown, Award } from 'lucide-react'
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
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Chart } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  BarController,
  LineController
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaintenanceToggle } from './Maintance'
import ProductQuantities from './QuantityProducts'

// Register all necessary ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  BarController,
  LineController
)

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
type TimeRange = 'day' | 'week' | 'month' | 'year'

interface OrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  color?: string
  colorName?:string
  size?: string
}

interface Customer {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode?: string
}

interface Order {
  _id: string
  _createdAt: string
  status: OrderStatus
  total: number
  shippingCost?: number
  paymentMethod: string
  customer: Customer
  items: OrderItem[]
}

interface StatusCounts {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

interface LoyalCustomer {
  email: string
  orderCount: number
  totalSpent: number
}

interface OrderTrends {
  labels: string[]
  orderCounts: number[]
  revenue: number[]
}

interface Summary {
  totalOrders: number
  totalRevenue: number
  totalRevenueWithoutShipping: number
  totalShippingCost: number
  statusCounts: StatusCounts
  loyalCustomers: LoyalCustomer[]
  orderTrends: OrderTrends
}

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function AdminOrdersDashboard() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalRevenueWithoutShipping: 0,
    totalShippingCost: 0,
    statusCounts: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    loyalCustomers: [],
    orderTrends: {
      labels: [],
      orderCounts: [],
      revenue: [],
    }
  })



  const toggleMaintenanceMode = async () => {
    try {
      const newMode = !maintenanceMode
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance: newMode }),
      })
      setMaintenanceMode(newMode)
      toast.success(`Maintenance mode ${newMode ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update maintenance mode')
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await client.fetch<Order[]>(`*[_type == "order"] | order(_createdAt desc)`)
      setOrders(data)
      
      // Calculate summary
      const revenue = data.reduce((sum, order) => sum + order.total, 0)
      const shippingCost = data.reduce((sum, order) => sum + (order.shippingCost || 375), 0)
      const revenueWithoutShipping = revenue - shippingCost
      
      // Group orders by customer email
      const customerMap = new Map<string, {count: number, total: number}>()
      data.forEach((order) => {
        const email = order.customer.email
        if (customerMap.has(email)) {
          const customer = customerMap.get(email)!
          customerMap.set(email, {
            count: customer.count + 1,
            total: customer.total + order.total
          })
        } else {
          customerMap.set(email, {count: 1, total: order.total})
        }
      })
      
      // Get top 5 loyal customers
      const loyalCustomers = Array.from(customerMap.entries())
        .map(([email, {count, total}]) => ({email, orderCount: count, totalSpent: total}))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
      
      // Calculate order trends based on selected time range
      const trends = calculateOrderTrends(data, timeRange)
      
      const statusCounts = {
        pending: data.filter((order) => order.status === 'pending').length,
        processing: data.filter((order) => order.status === 'processing').length,
        shipped: data.filter((order) => order.status === 'shipped').length,
        delivered: data.filter((order) => order.status === 'delivered').length,
        cancelled: data.filter((order) => order.status === 'cancelled').length,
      }
      
      setSummary({
        totalOrders: data.length,
        totalRevenue: revenue,
        totalRevenueWithoutShipping: revenueWithoutShipping,
        totalShippingCost: shippingCost,
        statusCounts,
        loyalCustomers,
        orderTrends: trends
      })
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const calculateOrderTrends = (orders: Order[], range: TimeRange): OrderTrends => {
    const now = new Date()
    let labels: string[] = []
    let orderCounts: number[] = []
    let revenue: number[] = []
    
    if (range === 'day') {
      // Last 24 hours by hour
      labels = Array.from({length: 24}, (_, i) => {
        const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
        return hour.getHours().toString().padStart(2, '0') + ':00'
      })
      
      orderCounts = Array(24).fill(0)
      revenue = Array(24).fill(0)
      
      orders.forEach(order => {
        const orderDate = new Date(order._createdAt)
        if (orderDate.getTime() > now.getTime() - 24 * 60 * 60 * 1000) {
          const hour = orderDate.getHours()
          orderCounts[hour]++
          revenue[hour] += order.total
        }
      })
    } else if (range === 'week') {
      // Last 7 days
      labels = Array.from({length: 7}, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      })
      
      orderCounts = Array(7).fill(0)
      revenue = Array(7).fill(0)
      
      orders.forEach(order => {
        const orderDate = new Date(order._createdAt)
        if (orderDate.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
          const day = 6 - Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000))
          if (day >= 0 && day < 7) {
            orderCounts[day]++
            revenue[day] += order.total
          }
        }
      })
    } else if (range === 'month') {
      // Last 30 days
      labels = Array.from({length: 30}, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
        return date.getDate().toString()
      })
      
      orderCounts = Array(30).fill(0)
      revenue = Array(30).fill(0)
      
      orders.forEach(order => {
        const orderDate = new Date(order._createdAt)
        if (orderDate.getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000) {
          const day = 29 - Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000))
          if (day >= 0 && day < 30) {
            orderCounts[day]++
            revenue[day] += order.total
          }
        }
      })
    } else { // year
      // Last 12 months
      labels = Array.from({length: 12}, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        return date.toLocaleDateString('en-US', { month: 'short' })
      })
      
      orderCounts = Array(12).fill(0)
      revenue = Array(12).fill(0)
      
      orders.forEach(order => {
        const orderDate = new Date(order._createdAt)
        if (orderDate.getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1000) {
          const monthDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + now.getMonth() - orderDate.getMonth()
          if (monthDiff >= 0 && monthDiff < 12) {
            orderCounts[11 - monthDiff]++
            revenue[11 - monthDiff] += order.total
          }
        }
      })
    }
    
    return { labels, orderCounts, revenue }
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

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await client.patch(orderId).set({ status: newStatus }).commit()
      await fetchOrders()
      toast.success('Order status updated')
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return
    
    try {
      await client.delete(orderId)
      await fetchOrders()
      toast.success('Order deleted successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete order')
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value)
    const trends = calculateOrderTrends(orders, value)
    setSummary(prev => ({
      ...prev,
      orderTrends: trends
    }))
  }

  const chartData: ChartData<'bar' | 'line'> = {
    labels: summary.orderTrends.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Order Count',
        data: summary.orderTrends.orderCounts,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Revenue (LKR)',
        data: summary.orderTrends.revenue,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ]
  }

  const chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
        }
      },
      title: {
        display: true,
        text: `Order Trends by ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
        color: '#e5e7eb',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)'
        },
        ticks: {
          color: '#9ca3af',
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(55, 65, 81, 0.5)'
        },
        ticks: {
          color: '#9ca3af',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
          color: 'rgba(55, 65, 81, 0.5)'
        },
        ticks: {
          color: '#9ca3af',
        }
      },
    },
    maintainAspectRatio: false,
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <Button 
            onClick={downloadAllOrders} 
            className="gap-2 bg-gray-800 hover:bg-gray-700 text-white"
          >
            <Download className="h-4 w-4" />
            Export All Orders
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-900 border border-gray-800 text-white">
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-white"
            >
              Inventory
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <ProductQuantities />
          </TabsContent>
        </Tabs>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Order Analytics</CardTitle>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-white text-xs">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    <SelectItem value="day" className="hover:bg-gray-800 focus:bg-gray-800">Daily</SelectItem>
                    <SelectItem value="week" className="hover:bg-gray-800 focus:bg-gray-800">Weekly</SelectItem>
                    <SelectItem value="month" className="hover:bg-gray-800 focus:bg-gray-800">Monthly</SelectItem>
                    <SelectItem value="year" className="hover:bg-gray-800 focus:bg-gray-800">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <Chart type='bar' data={chartData} options={chartOptions} />
            </CardContent>
          </Card>

          {/* Loyal Customers */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  Top Customers
                </CardTitle>
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.loyalCustomers.length > 0 ? (
                  summary.loyalCustomers.map((customer, index) => (
                    <div key={customer.email} className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-yellow-400">
                        {index === 0 ? <Star className="h-4 w-4 fill-current" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {customer.email}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{customer.orderCount} orders</span>
                          <span>LKR {customer.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No customer data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
         
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                <Package className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.totalOrders}</div>
              <p className="text-xs text-gray-400 mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Gross Revenue</CardTitle>
                <CreditCard className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">LKR {summary.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">Including shipping</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Net Revenue</CardTitle>
                <CreditCard className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">LKR {summary.totalRevenueWithoutShipping.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">Without shipping</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Shipping Costs</CardTitle>
                <Truck className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">LKR {summary.totalShippingCost.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">Total shipping</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-300">Active Customers</CardTitle>
                <User className="h-5 w-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {new Set(orders.map(order => order.customer.email)).size}
              </div>
              <p className="text-xs text-gray-400 mt-1">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-8 text-center text-gray-500">
                  No orders found
                </CardContent>
              </Card>
            ) : (
              orders.map(order => {
                const itemCount = order.items?.reduce((t, item) => t + item.quantity, 0)
                const statusColor = STATUS_COLORS[order.status]
                const statusLabel = STATUS_LABELS[order.status]

                return (
                  <Card key={order._id} className="overflow-hidden bg-gray-900 border-gray-800">
                    <CardHeader className="p-4 border-b border-gray-800">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${statusColor}`}>
                            {STATUS_ICONS[order.status]}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize bg-gray-800 text-white border-gray-700">
                                {statusLabel}
                              </Badge>
                              <div className="text-sm text-gray-400">
                                {new Date(order._createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <div className="font-medium text-white">LKR {order.total.toFixed(2)}</div>
                            <div className="text-sm text-gray-400">
                              {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                            onClick={() => downloadSingleOrder(order._id)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                            onClick={() => handleSendInvoice(order._id)}
                            title="Send Invoice"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-gray-800"
                            onClick={() => deleteOrder(order._id)}
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                            onClick={() => toggleOrderExpansion(order._id)}
                            title={expandedOrder === order._id ? 'Collapse' : 'Expand'}
                          >
                            {expandedOrder === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedOrder === order._id && (
                      <CardContent className="p-4 pt-0 bg-gray-950">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-300">
                                <User className="h-4 w-4 text-blue-400" />
                                Customer Information
                              </h3>
                              <div className="text-sm space-y-1 bg-gray-800 p-3 rounded-md text-gray-300">
                                <div className="font-medium text-white">{order.customer.firstName} {order.customer.lastName}</div>
                                <div>{order.customer.email}</div>
                                {order.customer.phone && <div>{order.customer.phone}</div>}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-300">
                                <CreditCard className="h-4 w-4 text-green-400" />
                                Payment & Shipping
                              </h3>
                              <div className="text-sm space-y-2 bg-gray-800 p-3 rounded-md text-gray-300">
                                <div className="flex justify-between">
                                  <span>Payment Method:</span>
                                  <span className="capitalize text-white">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping Cost:</span>
                                  <span className="text-white">LKR {(order.shippingCost || 375).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Order Total:</span>
                                  <span className="text-white">LKR {order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-300">
                              <Truck className="h-4 w-4 text-purple-400" />
                              Shipping Address
                            </h3>
                            <div className="text-sm bg-gray-800 p-3 rounded-md text-gray-300 whitespace-pre-line">
                              {order.customer.address}
                              <br />
                              {order.customer.city}
                              {order.customer.postalCode && <>, {order.customer.postalCode}</>}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2 text-gray-300">Order Status</h3>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={order.status}
                                  onValueChange={(value: OrderStatus) => updateOrderStatus(order._id, value)}
                                  disabled={updatingOrderId === order._id}
                                >
                                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    {STATUS_OPTIONS.map(status => (
                                      <SelectItem 
                                        key={status} 
                                        value={status}
                                        className="hover:bg-gray-800 focus:bg-gray-800"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
                                          {STATUS_LABELS[status]}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {updatingOrderId === order._id && <Loader2 className="animate-spin h-4 w-4 text-gray-500" />}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-300">
                                <Package className="h-4 w-4 text-amber-400" />
                                Order Items ({itemCount})
                              </h3>
                              <div className="space-y-3">
                                {order.items?.map((item) => (
                                  <div 
                                    key={`${item.productId}-${item.color}-${item.size}`} 
                                    className="p-3 bg-gray-800 rounded-md text-sm text-gray-300"
                                  >
                                    <div className="font-semibold text-white">{item.title}</div>
                                    <div className="text-gray-400 text-xs mt-1">
                                      {item.color && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          {item.colorName}
                                        </div>
                                      )}
                                      {item.size && <span className={item.color ? 'ml-2' : ''}>Size: {item.size}</span>}
                                    </div>
                                    <Separator className="my-2 bg-gray-700" />
                                    <div className="flex justify-between items-center">
                                      <span>Quantity: {item.quantity}</span>
                                      <span className="font-medium text-white">LKR {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
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
      </div>
      <MaintenanceToggle/>
    </div>
  )
}
