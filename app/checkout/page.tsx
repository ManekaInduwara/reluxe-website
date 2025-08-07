'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/Context/CartContext'
import { client } from '@/sanity/lib/client'
import { CheckoutForm } from '@/app/Components/Checkout/CheckoutForm'
import { OrderSummary } from '@/app/Components/Checkout/OrderSummary'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CartItem } from '../Components/interface'

interface CartItemWithStock extends CartItem {
  currentQuantity: number
  sizeQuantity?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const { cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [stockReduced, setStockReduced] = useState(false)

  const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0)
  const shippingCost = 375
  const total = subtotal + shippingCost

  const verifyStock = async (): Promise<boolean> => {
    try {
      const itemsWithStock = await Promise.all(
        cartItems.map(async (item) => {
          const product = await client.fetch(
            `*[_id == $id][0]{
              colors[_key == $color][0]{
                quantity,
                sizes[size == $size][0]{ quantity }
              }
            }`,
            { 
              id: item.productId,
              color: item.color,
              size: item.size 
            }
          )

          if (!product?.colors?.[0]) {
            throw new Error(`Color variant not found for ${item.title}`)
          }

          const currentQuantity = product.colors[0].quantity
          const sizeQuantity = item.size ? product.colors[0].sizes?.[0]?.quantity : undefined

          if (currentQuantity < item.quantity) {
            throw new Error(`Not enough stock for ${item.title}`)
          }

          if (item.size && sizeQuantity && sizeQuantity < item.quantity) {
            throw new Error(`Not enough stock for size ${item.size} of ${item.title}`)
          }

          return {
            ...item,
            currentQuantity,
            sizeQuantity
          }
        })
      )

      return true
    } catch (error) {
      toast.error('Stock issue', {
        description: error.message
      })
      return false
    }
  }

  const reduceStock = async () => {
    if (stockReduced) return

    const stockVerified = await verifyStock()
    if (!stockVerified) return false

    try {
      const operations = cartItems.map(item => ({
        patch: {
          id: item.productId,
          dec: {
            availableQuantity: item.quantity,
            [`colors[_key=="${item.color}"].quantity`]: item.quantity,
            ...(item.size && {
              [`colors[_key=="${item.color}"].sizes[size=="${item.size}"].quantity`]: item.quantity
            })
          },
          set: {
            lastStockUpdate: new Date().toISOString()
          }
        }
      }))

      await client.transaction(operations).commit()
      setStockReduced(true)
      return true
    } catch (error) {
      console.error('Stock reduction failed:', error)
      toast.error('Failed to update inventory')
      return false
    }
  }

  const handleProceedPayment = async () => {
    setLoading(true)
    
    try {
      // 1. Validate form if needed
      if (formRef.current && !formRef.current.reportValidity()) {
        return
      }

      // 2. Reduce stock
      const stockReduced = await reduceStock()
      if (!stockReduced) return

      // 3. Process payment (simulated)
      setPaymentUrl('/payment-processing')
      
      // 4. Create order in Sanity
      const order = {
        _type: 'order',
        status: 'processing',
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          colorName: item.colorName,
          size: item.size,
          image: item.image
        })),
        subtotal,
        shipping: shippingCost,
        total,
        createdAt: new Date().toISOString()
      }

      const createdOrder = await client.create(order)
      clearCart()

      // 5. Redirect to confirmation
      router.push(`/order-confirmation/${createdOrder._id}`)

    } catch (error) {
      toast.error('Checkout failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-poppins)]">
      {paymentUrl ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Processing your order...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <CheckoutForm
            ref={formRef}
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />
          
          <OrderSummary
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            onSubmit={handleProceedPayment}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
