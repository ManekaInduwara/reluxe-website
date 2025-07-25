'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  currentQuantity: number | undefined
  sizeQuantity: number | undefined
  id: Key | null | undefined
  colorName: string
  productId: string
  title: string
  price: number
  color: string
  size: string | null
  image: string | { _id: string; url: string }
  quantity?: number
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, color: string, size: string | null) => void
  updateQuantity: (productId: string, color: string, size: string | null, change: number) => void
  isInCart: (productId: string, color: string, size: string | null) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => { },
  removeFromCart: () => { },
  updateQuantity: () => { },
  isInCart: () => false,
  clearCart: function (): void {
    throw new Error('Function not implemented.')
  }
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
      )
      
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId && i.color === item.color && i.size === item.size
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        )
      }
      
      return [...prevItems, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string, color: string, size: string | null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.color === color && item.size === size)
      )
    )
  }

  const updateQuantity = (productId: string, color: string, size: string | null, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.color === color && item.size === size) {
          const newQuantity = (item.quantity || 1) + change
          return {
            ...item,
            quantity: newQuantity > 0 ? newQuantity : 1,
          }
        }
        return item
      })
    )
  }

  const isInCart = (productId: string, color: string, size: string | null) => {
    return cartItems.some(
      (item) => item.productId === productId && item.color === color && item.size === size
    )
  }

    const clearCart = () => {
    setCartItems([])   // 👈 Clears the entire cart
  }


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
         clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)