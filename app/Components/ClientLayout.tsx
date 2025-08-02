'use client' 

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { Toaster } from 'sonner'
import CartDisplay from './CartDisplay'

// Define routes where layout elements should be hidden
const HIDE_LAYOUT_ROUTES = [
  '/countdown',
   '/studio',
    '/admin',
  '/order-confirmation',
  /^\/orders\/[a-zA-Z0-9-]+$/, // matches /orders/:id
  /^\/checkout(\/.*)?$/, // matches /checkout and any sub-paths
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if current route should hide layout elements
  const hideLayout = HIDE_LAYOUT_ROUTES.some(route => 
    typeof route === 'string' 
      ? pathname.startsWith(route)
      : route.test(pathname)
  )

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <CartDisplay />}
      
      <main className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        {children}
      </main>
      
      {!hideLayout && <Footer />}
      
    
    </>
  )
}