'use client'

import { useCart } from '@/app/Context/CartContext'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, X, Plus, Minus, ArrowRight, ShoppingBag, Package, CreditCard, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ImageWithFallback from '@/app/Components/ImageWithFallBack'
import { getSanityImageUrl } from '@/utils/sanityImage'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function CartDisplay() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const cartTriggerRef = useRef<HTMLButtonElement>(null)
  const sheetContentRef = useRef<HTMLDivElement>(null)

  const shippingCost = 375
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0)
  const totalPrice = subtotal + shippingCost

  // GSAP Animations
  useGSAP(() => {
    // Cart icon bounce animation when items change
    if (itemCount > 0) {
      gsap.to(cartTriggerRef.current, {
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      })
    }

    // Cart sheet entrance animation
    if (isOpen) {
      gsap.from(sheetContentRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out"
      })
    }
  }, [itemCount, isOpen])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const handleProceedToCheckout = () => {
    // Close animation
    gsap.to(sheetContentRef.current, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setIsOpen(false)
        setTimeout(() => {
          router.push('/checkout')
        }, 300)
      }
    })
  }

  const handleRemoveItem = (productId: string, color: string, size: string | null) => {
    // Item removal animation
    const itemElement = document.getElementById(`${productId}-${color}-${size}`)
    if (itemElement) {
      gsap.to(itemElement, {
        x: 100,
        opacity: 0,
        height: 0,
        marginBottom: 0,
        paddingBottom: 0,
        duration: 0.3,
        onComplete: () => removeFromCart(productId, color, size)
      })
    } else {
      removeFromCart(productId, color, size)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-[family-name:var(--font-poppins)]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            ref={cartTriggerRef}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full hover:bg-accent bg-black transition-transform"
            onClick={() => setIsOpen(true)}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-amber-100">
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent 
          ref={sheetContentRef}
          className="w-full sm:max-w-lg flex flex-col border-hidden bg-black text-amber-50 font-[family-name:var(--font-poppins)]"
        >
          <SheetHeader>
            <SheetTitle className="text-lg text-amber-50 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({itemCount})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
                <p className="text-gray-300">Your cart is empty</p>
                <Button asChild className="mt-4 bg-red-700 hover:bg-red-800 flex items-center gap-2">
                  <Link href="/products">
                    <Package className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    id={`${item.productId}-${item.color}-${item.size}`}
                    className="flex gap-4 border-b pb-4 border-gray-800"
                  >
                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                      <ImageWithFallback
                        src={getSanityImageUrl(item.image)}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md border border-gray-700"
                        fallback={
                          <div className="bg-gray-900 text-amber-50 h-full w-full flex items-center justify-center rounded-md">
                            <span className="text-xs">No image</span>
                          </div>
                        }
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-800"
                          onClick={() => handleRemoveItem(item.productId, item.color, item.size)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-sm text-gray-400">
                        <p>Color: #{item.color}</p>
                        {item.size && <p>Size: {item.size}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-700 rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-800"
                            onClick={() => updateQuantity(item.productId, item.color, item.size, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-sm">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-800"
                            onClick={() => updateQuantity(item.productId, item.color, item.size, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-medium">
                          LKR {(item.price * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Subtotal:
                </span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping:
                </span>
                <span>LKR {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 mt-2 border-t border-gray-800">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Total:
                </span>
                <span>LKR {totalPrice.toFixed(2)}</span>
              </div>

              <Button
                className="w-full mt-4 bg-gray-900 hover:bg-gray-800 rounded-md transition-colors flex items-center gap-2"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}