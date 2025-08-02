'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown, LogIn, UserPlus } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { 
  SignedIn, 
  SignedOut, 
  UserButton, 
  SignInButton, 
  SignUpButton 
} from '@clerk/nextjs'

const subcategories = {
  Women: [
    { label: 'All Women', href: '/category/women' },
    { label: 'Oversized Tees', href: '/category/oversized-tees' },
    { label: 'Tops', href: '/category/tops' },
    { label: 'Bottoms', href: '/category/bottoms' },
    { label: 'Shoes', href: '/category/shoes' },
  ],
  Men: [
    { label: 'All Men', href: '/category/men' },
    { label: 'Oversized Tees', href: '/category/oversized-tees' },
    { label: 'Pants', href: '/category/pants' },
    { label: 'Sneakers', href: '/category/sneakers' },
  ],
}

const staticLinks = [
  { label: 'Accessories', href: '/accessories' },
  { label: 'New', href: '/new' },
]

export default function NavbarWithSubcategories() {
  const [open, setOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const pathname = usePathname()

  return (
    <motion.header 
      className="w-full px-4 py-3 bg-transparent backdrop-blur-lg sticky top-0 z-50 font-[family-name:var(--font-poppins)]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with animation */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/" className="text-lg font-semibold uppercase tracking-wide text-white">
            Reluxe
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {Object.entries(subcategories).map(([main, sub]) => (
            <div 
              key={main} 
              className="relative"
              onMouseEnter={() => setHoveredCategory(main)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <motion.button 
                className="flex items-center gap-1 text-sm font-medium hover:text-gray-300 transition relative group text-white"
                whileHover={{ scale: 1.05 }}
              >
                <span>{main}</span>
                <motion.span
                  animate={{
                    rotate: hoveredCategory === main ? 180 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-white" />
                </motion.span>
                
                {/* Hover underline animation */}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                
                {/* Active indicator */}
                {pathname && pathname.startsWith(`/${main.toLowerCase()}`) && (
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
              
              <AnimatePresence>
                {hoveredCategory === main && (
                  <motion.div
                    className="absolute flex flex-col border rounded-lg shadow-lg mt-2 p-3 w-44 z-20 bg-black/90 backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {sub.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm text-white py-1 px-2 rounded hover:bg-white/10 transition-colors relative group"
                      >
                        <span>{item.label}</span>
                        <motion.span
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {staticLinks.map((link) => (
            <motion.div 
              key={link.href}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Link
                href={link.href}
                className="text-sm font-medium hover:text-gray-300 transition relative text-white"
              >
                <span>{link.label}</span>
                {/* Hover underline animation */}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
                {/* Active indicator */}
                {pathname === link.href && (
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                    layoutId="staticActiveIndicator"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right side icons (auth only) */}
        <div className="flex items-center gap-4">
          {/* Clerk Auth - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-black border border-gray-800",
                    userPreviewMainIdentifier: "text-white",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-white",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 border-hidden"
                    aria-label="Sign in"
                  >
                    <LogIn className="h-5 w-5" />
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white text-black hover:bg-gray-200 border-hidden"
                    aria-label="Sign up"
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden font-[family-name:var(--font-poppins)]">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-white/10 border-hidden"
                  asChild
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    {open ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
                  </motion.div>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] bg-black/90 backdrop-blur-sm border-hidden"
              >
                <DialogTitle className="sr-only">Mobile Navigation Menu</DialogTitle>

                <motion.nav 
                  className="flex flex-col space-y-6 px-4 pt-10"
                  initial={{ x: 300 }}
                  animate={{ x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {Object.entries(subcategories).map(([main, subs]) => (
                    <motion.div 
                      key={main}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold mb-2 text-white">{main}</p>
                        <ChevronDown className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-2 flex flex-col space-y-2">
                        {subs.map((item, index) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="text-sm text-white hover:underline py-1 px-2 rounded block relative group"
                            >
                              <span>{item.label}</span>
                              <motion.span
                                className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                              />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {staticLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium block py-2 hover:bg-white/10 px-2 rounded relative group text-white"
                        >
                          <span>{link.label}</span>
                          <motion.span
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-white"
                            initial={{ width: 0 }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Mobile Auth */}
                  <motion.div
                    className="pt-6 border-t border-gray-800"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <SignedIn>
                      <div className="flex items-center gap-3">
                        <UserButton 
                          afterSignOutUrl="/"
                          appearance={{
                            elements: {
                              avatarBox: "h-8 w-8",
                              userButtonPopoverCard: "bg-black border border-gray-800"
                            }
                          }}
                        />
                        <span className="text-sm text-white">My Account</span>
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <div className="flex flex-col gap-3">
                        <SignInButton mode="modal">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-white hover:bg-white/10 border-hidden flex items-center gap-2"
                            onClick={() => setOpen(false)}
                          >
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full bg-white text-black hover:bg-gray-200 border-hidden flex items-center gap-2"
                            onClick={() => setOpen(false)}
                          >
                            <UserPlus className="h-4 w-4" />
                            Create Account
                          </Button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                  </motion.div>
                </motion.nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}