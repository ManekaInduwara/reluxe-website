import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle,
  Banknote,
  FileImage,
  ShoppingCart,
  Mail,
} from 'lucide-react'

interface OrderConfirmationProps {
  params: { id: string }
}

export default async function OrderConfirmation({ params }: OrderConfirmationProps) {
  const order = await client.fetch(
    `*[_type == "order" && _id == $id][0]{
      _id,
      status,
      paymentMethod,
      total,
      subtotal,
      shipping,
      customer,
      items[] {
        productId,
        title,
        price,
        quantity,
        color,
        colorName,
        size,
        image
      },
      bankSlipNumber,
      bankSlipImage { asset-> },
      createdAt
    }`,
    { id: params.id }
  )

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center font-[family-name:var(--font-poppins)]">
        <h1 className="text-xl font-semibold text-red-600">Order not found</h1>
        <p className="text-gray-400 mt-2">Please check your confirmation link or contact support.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl font-[family-name:var(--font-poppins)]">
      <div className="bg-black text-white rounded-lg p-6 space-y-6">
        {/* Order Confirmed Header */}
        <div className="text-center space-y-2">
          <CheckCircle className="mx-auto text-green-500 h-10 w-10" />
          <h1 className="text-xl font-semibold uppercase tracking-wide">Order Confirmed</h1>
          <p className="text-gray-400">
            Your order <span className="font-medium text-white">#{order._id.slice(-6).toUpperCase()}</span> has been received.
          </p>
        </div>

        {/* Bank Payment Details */}
        {order.paymentMethod === 'bank' && (
          <div className="space-y-4 border-b border-gray-700 pb-6">
            <div className="flex items-center gap-2">
              <Banknote className="text-red-500 h-5 w-5" />
              <h2 className="font-medium uppercase tracking-wide">Bank Deposit Details</h2>
            </div>
            
            <div className="grid gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400">Bank: <span className="text-white">Bank Of Ceylon(BOC)</span></p>
                <p className="text-gray-400">Account Name: <span className="text-white">M D N Dilmina </span></p>
                <p className="text-gray-400">Account Number: <span className="text-white">80041494</span></p>
                <p className="text-gray-400">Amount: <span className="text-white">LKR {order.total.toFixed(2)}</span></p>
                {order.bankSlipNumber && (
                  <p className="text-gray-400">Slip Number: <span className="text-white">{order.bankSlipNumber}</span></p>
                )}
              </div>
              
              {order.bankSlipImage?.asset && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileImage className="text-red-500 h-5 w-5" />
                    <h3 className="text-sm font-medium">Uploaded Bank Slip</h3>
                  </div>
                  <div className="relative h-48 w-full rounded-md overflow-hidden bg-neutral-800">
                    <Image
                      src={urlFor(order.bankSlipImage).url()}
                      alt="Bank deposit slip"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    We'll verify your payment and update you via email.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-red-500 h-5 w-5" />
            <h2 className="font-medium uppercase tracking-wide">Order Summary</h2>
          </div>
          
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex gap-4 py-4 border-b border-gray-800"
              >
                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-neutral-800">
                  <Image
                    src={urlFor(item.image).url()}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400">
                    Color:  {item.colorName || item.color}<br/> Size: {item.size && `• ${item.size}`}
                  </p>
                  <p className="text-sm text-gray-300">
                    {item.quantity} × LKR {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="font-medium">
                  LKR {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Totals */}
        <div className="space-y-2 pt-4 border-t border-gray-800 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">LKR {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shipping</span>
            <span className="text-white">LKR {order.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t mt-2 border-gray-700 text-base">
            <span>Total</span>
            <span className="text-red-500">LKR {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center space-y-4">
          <Button asChild className="w-full bg-red-600 hover:bg-red-700">
            <Link href="/category/all">Continue Shopping</Link>
          </Button>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
            <Mail className="h-4 w-4" />
            <p>We'll send you a confirmation email shortly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}