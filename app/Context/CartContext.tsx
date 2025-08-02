'use client'

import { createContext, useContext, useState, useEffect, Key } from 'react'

type CartItem = {
  productId: string
  title: string
  price: number
  color: string
  size: string | null
  image: string | { _id: string; url: string }
  quantity: number
  id?: Key | null
  colorName: string
  currentQuantity?: number
  sizeQuantity?: number
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, color: string, size: string | null) => void
  updateQuantity: (productId: string, color: string, size: string | null, change: number) => void
  isInCart: (productId: string, color: string, size: string | null) => boolean
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  setDirectCheckoutItem: (item: CartItem) => void
  directCheckoutItem: CartItem | null
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  isInCart: () => false,
  clearCart: () => {},
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  setDirectCheckoutItem: () => {},
  directCheckoutItem: null
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse cart data', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.productId === item.productId && 
               i.color === item.color && 
               i.size === item.size
      )

      const availableQuantity = item.sizeQuantity || item.currentQuantity
      if (availableQuantity !== undefined && availableQuantity <= 0) {
        return prevItems
      }

      if (existingItem) {
        const newQuantity = (existingItem.quantity || 1) + 1
        
        if (availableQuantity !== undefined && newQuantity > availableQuantity) {
          return prevItems.map((i) =>
            i.productId === item.productId && 
            i.color === item.color && 
            i.size === item.size
              ? { ...i, quantity: availableQuantity }
              : i
          )
        }
        
        return prevItems.map((i) =>
          i.productId === item.productId && 
          i.color === item.color && 
          i.size === item.size
            ? { ...i, quantity: newQuantity }
            : i
        )
      }
      
      const initialQuantity = Math.min(1, availableQuantity || 1)
      return [...prevItems, { ...item, quantity: initialQuantity }]
    })
    
    openCart()
  }

  const removeFromCart = (productId: string, color: string, size: string | null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && 
                   item.color === color && 
                   item.size === size)
      )
    )
  }

  const updateQuantity = (
    productId: string, 
    color: string, 
    size: string | null, 
    change: number
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && 
            item.color === color && 
            item.size === size) {
          const newQuantity = (item.quantity || 1) + change
          const maxAvailable = item.sizeQuantity || item.currentQuantity || Infinity
          const clampedQuantity = Math.max(1, Math.min(newQuantity, maxAvailable))
          
          return {
            ...item,
            quantity: clampedQuantity,
          }
        }
        return item
      })
    )
  }

  const isInCart = (productId: string, color: string, size: string | null) => {
    return cartItems.some(
      (item) => item.productId === productId && 
               item.color === color && 
               item.size === size
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        setDirectCheckoutItem,
        directCheckoutItem
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)