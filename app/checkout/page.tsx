'use client'

import { useRef, useState } from 'react'
import { useCart } from '@/app/Context/CartContext'
import { client } from '@/sanity/lib/client'
import { CheckoutForm } from '@/app/Components/Checkout/CheckoutForm'
import { OrderSummary } from '@/app/Components/Checkout/OrderSummary'
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [stockReduced, setStockReduced] = useState(false)

  const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0)
  const shippingCost = 375
  const total = subtotal + shippingCost

  const reduceStock = async () => {
    if (stockReduced) return

    const operations = cartItems.map(item => ({
      patch: {
        id: item.productId,
        set: {
          [`colors[_key=="${item.color}"].quantity`]: ((item.currentQuantity || 0) - item.quantity),
          ...(item.size && {
            [`colors[_key=="${item.color}"].sizes[size=="${item.size}"].quantity`]:
              ((item.sizeQuantity || 0) - item.quantity)
          })
        }
      }
    }))

    await client.transaction(operations).commit()
    setStockReduced(true)
    clearCart()   // ✅ Automatically clear cart after stock reduction
  }

  // Optional: Trigger reduceStock during payment or form submission as appropriate
  const handleProceedPayment = async () => {
    setLoading(true)
    await reduceStock()
    setPaymentUrl('/redirecting-to-payment')  // Simulate payment redirection
  }

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-poppins)]">
      {paymentUrl ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>Redirecting to payment gateway...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <CheckoutForm
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />
          <OrderSummary
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            onSubmit={handleProceedPayment}   // ✅ Trigger payment + stock reduction + clear cart
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
