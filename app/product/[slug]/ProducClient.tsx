'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  Check, 
  ShoppingCart, 
  Zap, 
  Truck, 
  Info, 
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2
} from 'lucide-react'

import ImageGallery from '@/app/Components/ImageGallery'
import { ColorSelector } from '@/app/Components/ColorSelector'
import { SizeSelector } from '@/app/Components/SizeSelector'
import { SizeGuidePopup } from '@/app/Components/SizeGuideModal'
import { ReadMore } from '@/app/Components/ReadMore'
import { useCart } from '@/app/Context/CartContext'

export default function ProductClient({ data }: { data: any }) {
  const { addToCart, isInCart } = useCart()
  
  const [selectedColor, setSelectedColor] = useState(data.colors[0]?._key || '')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const currentColor = data.colors.find((c: any) => c._key === selectedColor) || data.colors[0]
  const currentColorImage = currentColor?.image || data.mainImage
  const discountedPrice = data.discount 
    ? data.price * (1 - data.discount / 100)
    : null
  const standardShippingCost = 375
  const subtotal = discountedPrice || data.price
  const totalPrice = subtotal + standardShippingCost
  const productImage = currentColor?.images?.[0] || data.mainImages?.[0]
  const alreadyInCart = isInCart(data._id, selectedColor, selectedSize)

  // GSAP animations
  useGSAP(() => {
    // Initial animations
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })

    gsap.from(priceRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out"
    })

    gsap.from(".selector-section", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.4,
      ease: "power2.out"
    })

    gsap.from(buttonsRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.8,
      ease: "power2.out"
    })
  }, { scope: containerRef })

  const handleAddToCart = async () => {
    if (!selectedColor || (currentColor?.sizes?.length && !selectedSize)) {
      setShowValidation(true)
      
      // Shake animation for validation
      gsap.to(containerRef.current, {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: "power1.out"
      })
      return
    }

    setIsAdding(true)
    
    try {
      addToCart({
        productId: data._id,
        title: data.title,
        price: discountedPrice || data.price,
        color: selectedColor,
        size: selectedSize,
        image: productImage,
        id: undefined,
        colorName: '',
        currentQuantity: undefined,
        sizeQuantity: undefined
      })
      
      // Success animation
      setAddedToCart(true)
      gsap.from(successRef.current, {
        y: -20,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: "back.out(1.7)"
      })
      
      setTimeout(() => {
        gsap.to(successRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          onComplete: () => setAddedToCart(false)
        })
      }, 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div 
      className="bg-black font-[family-name:var(--font-poppins)] min-h-screen"
      ref={containerRef}
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-12">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Image Gallery Section */}
          <div className="relative">
            <ImageGallery 
              colors={data.colors} 
              title={data.title} 
              mainImages={data.mainImages}
              selectedColorKey={selectedColor}
            />
          </div>
          
          {/* Product Info Section */}
          <div className="space-y-8 text-white">
            {/* Product title and category */}
            <div className="space-y-2">
              <h1 
                className="text-4xl font-bold tracking-tight"
                ref={titleRef}
              >
                {data.title}
              </h1>
              <div className="text-sm text-gray-300 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-4 h-4" />
                {data.categoryName}
              </div>
            </div>

            {/* Price display */}
            <div className="flex flex-col gap-1" ref={priceRef}>
              {data.discount ? (
                <>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-semibold">
                      LKR{discountedPrice?.toFixed(2)}
                    </p>
                    <span className="text-sm bg-red-600 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-current" />
                      {data.discount}% OFF
                    </span>
                  </div>
                  <p className="text-base text-gray-400 line-through">
                    LKR{data.price.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-semibold">
                  LKR{data.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Color selector */}
            <div className="space-y-3 selector-section">
              <h3 className="text-lg font-medium flex items-center gap-2">
                Color
                {showValidation && !selectedColor && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </h3>
              <ColorSelector
                colors={data.colors}
                currentColor={selectedColor}
                onColorSelect={(colorKey) => {
                  setSelectedColor(colorKey)
                  setSelectedSize(null)
                  setShowValidation(false)
                  
                  // Color change animation
                  gsap.to(".color-selector", {
                    scale: 1.05,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                  })
                }}
              />
              {showValidation && !selectedColor && (
                <p className="text-sm text-red-500 animate-pulse flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please select a color
                </p>
              )}
            </div>
            
            {/* Size selector */}
            {currentColor?.sizes && (
              <div className="space-y-3 selector-section">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Size
                    {showValidation && !selectedSize && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </h3>
                  <SizeGuidePopup sizeGuide={data.sizeGuide} />
                </div>
                <SizeSelector
                  sizes={currentColor.sizes}
                  selectedSize={selectedSize}
                  onSizeSelect={(size) => {
                    setSelectedSize(size)
                    setShowValidation(false)
                    
                    // Size selection animation
                    gsap.from(`.size-${size}`, {
                      scale: 1.2,
                      duration: 0.3,
                      ease: "back.out(1.7)"
                    })
                  }}
                />
                {showValidation && !selectedSize && (
                  <p className="text-sm text-red-500 animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please select a size
                  </p>
                )}
              </div>
            )}

            {/* Shipping information */}
            <div className="border-t border-gray-700 pt-4 selector-section">
              <div className="flex justify-between text-gray-300">
                <span className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping
                </span>
                <span className="font-medium">LKR {standardShippingCost.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1 pl-7">
                Standard Delivery: 3-5 business days
              </p>
            </div>

            {/* Total price */}
            <div className="border-t border-gray-700 pt-4 pb-2 selector-section">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">LKR {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Product description */}
            {data.description && (
              <div className="border-t border-gray-700 pt-4 selector-section">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <ReadMore 
                  text={data.description} 
                  className="text-gray-300 leading-relaxed"
                  maxChars={200}
                  expandIcon={<ChevronDown className="w-5 h-5 ml-1" />}
                  collapseIcon={<ChevronUp className="w-5 h-5 ml-1" />}
                />
              </div>
            )}
            
            {/* Action buttons */}
            <div className="space-y-4" ref={buttonsRef}>
              {addedToCart && (
                <div 
                  className="text-green-400 text-center py-2 rounded-lg bg-green-900/30 border border-green-800 flex items-center justify-center gap-2"
                  ref={successRef}
                >
                  <Check className="w-5 h-5" />
                  Added to cart successfully!
                </div>
              )}
              
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedColor || 
                  (currentColor?.sizes?.length && !selectedSize) || 
                  isAdding || 
                  alreadyInCart
                }
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                  alreadyInCart ? 'bg-gray-700 text-gray-300' :
                  isAdding ? 'bg-gray-600' : 
                  'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {alreadyInCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Already in Cart
                  </>
                ) : isAdding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              
              <button
                className="w-full bg-black text-white py-4 px-6 rounded-lg font-medium border-2 border-white hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={!selectedColor || (currentColor?.sizes && !selectedSize)}
              >
                <Zap className="w-5 h-5" />
                Buy Now (LKR {totalPrice.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}