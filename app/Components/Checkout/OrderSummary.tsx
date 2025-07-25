'use client'

import { useCart } from '@/app/Context/CartContext'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function OrderSummary({
  subtotal,
  shippingCost,
  total,
  onSubmit,
  loading
}: {
  subtotal: number
  shippingCost: number
  total: number
  onSubmit: () => void
  loading: boolean
}) {
  const { cartItems } = useCart()

  return (
    <div className="space-y-6 bg-black p-6 rounded-lg max-w-xl mx-auto text-white">
      <h2 className="text-xl font-semibold border-b border-gray-700 pb-4 uppercase tracking-wide">
        Order Summary
      </h2>

      <div className="space-y-4">
        {cartItems.map(item => (
          <div
            key={`${item.productId}-${item.color}-${item.size}`}
            className="flex gap-4 py-4 border-b border-gray-800"
          >
            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-neutral-800">
              <Image
                src={getSanityImageUrl(item.image)}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-gray-400">
                {item.color} {item.size && `• ${item.size}`}
              </p>
              <p className="text-sm text-gray-300">
                {item.quantity} × LKR {item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        <div className="space-y-2 pt-4 border-t border-gray-800 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">LKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shipping</span>
            <span className="text-white">LKR {shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t mt-2 border-gray-700 text-base">
            <span>Total</span>
            <span>LKR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getSanityImageUrl(source: any) {
  if (!source) return '/placeholder-product.jpg'
  if (typeof source === 'string') return source
  if (source.asset?.url) return source.asset.url
  return '/placeholder-product.jpg'
}
