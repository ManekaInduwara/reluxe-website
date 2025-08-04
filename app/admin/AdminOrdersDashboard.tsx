'use client'

import { useEffect, useState, useCallback } from 'react'
import { client } from '@/sanity/lib/client'
import {
  Loader2,
  Download,
  Package,
  CreditCard,
  Crown,
  Award,
  Star,
  AlertTriangle,
} from 'lucide-react'
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
import { Bar, Line } from 'react-chartjs-2'
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
  Filler,
  BarController,
  LineController,
} from 'chart.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaintenanceToggle } from './Maintance'
import ProductQuantities from './QuantityProducts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
)

type TimeRange = 'day' | 'week' | 'month' | 'year'

interface Order {
  _id: string
  _createdAt: string
  status: string
  total: number
  shippingCost?: number
  paymentMethod: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
  }>
  customer?: {
    email: string
  }
}

interface Summary {
  totalOrders: number
  totalRevenue: number
  totalRevenueWithoutShipping: number
  totalShippingCost: number
  loyalCustomers: Array<{
    email: string
    orderCount: number
    totalSpent: number
  }>
  orderTrends: {
    labels: string[]
    orderCounts: number[]
    revenue: number[]
  }
}

export default function AdminOrdersDashboard() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalRevenueWithoutShipping: 0,
    totalShippingCost: 0,
    loyalCustomers: [],
    orderTrends: {
      labels: [],
      orderCounts: [],
      revenue: [],
    }
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await client.fetch<Order[]>(`*[_type == "order"] | order(_createdAt desc)`)
      if (!Array.isArray(data)) {
        toast.error('Failed to load orders')
        return
      }
      setOrders(data)

      const totalRevenue = data.reduce((sum, order) => sum + order.total, 0)
      const totalShippingCost = data.reduce((sum, order) => sum + (order.shippingCost || 0), 0)
      const revenueWithoutShipping = totalRevenue - totalShippingCost

      const customerMap = new Map<string, { count: number; total: number }>()
      data.forEach((order) => {
        const email = order.customer?.email || 'unknown'
        const total = order.total
        if (customerMap.has(email)) {
          const c = customerMap.get(email)!
          customerMap.set(email, { count: c.count + 1, total: c.total + total })
        } else {
          customerMap.set(email, { count: 1, total })
        }
      })

      const loyalCustomers = Array.from(customerMap.entries())
        .map(([email, { count, total }]) => ({ email, orderCount: count, totalSpent: total }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)

      const orderTrends = calculateOrderTrends(data, timeRange)

      setSummary({
        totalOrders: data.length,
        totalRevenue,
        totalRevenueWithoutShipping: revenueWithoutShipping,
        totalShippingCost,
        loyalCustomers,
        orderTrends
      })
    } catch (err) {
      toast.error('Error fetching orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const calculateOrderTrends = (orders: Order[], range: TimeRange) => {
    const now = new Date()
    let labels: string[] = []
    let orderCounts: number[] = []
    let revenue: number[] = []

    if (range === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (29 - i))
        return d.getDate().toString()
      })
      orderCounts = Array(30).fill(0)
      revenue = Array(30).fill(0)
      orders.forEach(order => {
        const date = new Date(order._createdAt)
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        const index = 29 - diff
        if (index >= 0 && index < 30) {
          orderCounts[index]++
          revenue[index] += order.total
        }
      })
    }

    return { labels, orderCounts, revenue }
  }

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const chartData = {
    labels: summary.orderTrends.labels,
    datasets: [
      {
        label: 'Order Count',
        data: summary.orderTrends.orderCounts,
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderColor: 'rgba(99,102,241,1)',
        yAxisID: 'y',
        type: 'bar' as const,
      },
      {
        label: 'Revenue (LKR)',
        data: summary.orderTrends.revenue,
        backgroundColor: 'rgba(16,185,129,0.6)',
        borderColor: 'rgba(16,185,129,1)',
        yAxisID: 'y1',
        type: 'line' as const,
        fill: false,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#e5e7eb' }
      },
      title: {
        display: true,
        text: `Order Trends (${timeRange})`,
        color: '#e5e7eb',
      },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#fff',
        bodyColor: '#ccc',
      }
    },
    scales: {
      x: {
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: {
          display: true,
          text: 'Orders',
          color: '#ccc'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#ccc' },
        title: {
          display: true,
          text: 'Revenue',
          color: '#ccc'
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order Dashboard</h1>
          <Button onClick={() => toast.info('Export coming soon')} className="bg-gray-800">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 bg-gray-900">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Analytics</CardTitle>
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  {summary.orderTrends.labels.length ? (
                    timeRange === 'year' ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <Bar data={chartData} options={chartOptions} />
                    )
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      No data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="text-yellow-400 w-5 h-5" />
                    Top Customers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary.loyalCustomers.length ? (
                    summary.loyalCustomers.map((c, i) => (
                      <div key={c.email} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 text-center">
                            {i === 0 ? <Star className="w-4 h-4 text-yellow-400 mx-auto mt-1" /> : i + 1}
                          </div>
                          <div className="text-white font-medium">{c.email}</div>
                        </div>
                        <div className="text-gray-400 text-xs ml-8">
                          {c.orderCount} orders – LKR {c.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No customer data</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <ProductQuantities />
          </TabsContent>
        </Tabs>
      </div>

      <MaintenanceToggle />
    </div>
  )
}
