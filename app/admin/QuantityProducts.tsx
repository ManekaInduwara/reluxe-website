'use client'

import { Package, Palette, Loader2, Image as ImageIcon, Ruler, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { client } from '@/sanity/lib/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

interface Product {
  _id: string
  title: string
  slug: { current: string }
  mainImages: Array<{
    asset: {
      _ref: string
    }
    alt?: string
  }>
  availableQuantity: number
  colors?: Array<{
    name: string
    color: {
      hex: string
    }
    quantity: number
    images?: Array<{
      asset: {
        _ref: string
      }
      alt?: string
    }>
    sizes?: Array<{
      size: string
      quantity: number
    }>
  }>
  sizeGuide?: {
    active: boolean
    title: string
    measurementImage?: {
      asset: {
        _ref: string
      }
    }
    chartType: string
    sizeChart?: Array<{
      region: string
      measurement: string
      values: Record<string, string>
    }>
  }
}

export default function ProductQuantities() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const query = `*[_type == "product"] {
        _id,
        title,
        slug,
        availableQuantity,
        mainImages,
        colors[] {
          name,
          color,
          quantity,
          images,
          sizes[] {
            size,
            quantity
          }
        },
        sizeGuide {
          active,
          title,
          measurementImage,
          chartType,
          sizeChart[] {
            region,
            measurement,
            values
          }
        }
      } | order(title asc)`
      
      const data = await client.fetch<Product[]>(query)
      setProducts(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-white">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-blue-400" />
            Product Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <div className="space-y-8">
            {products.length === 0 ? (
              <div className="text-center text-white py-4">
                No products found
              </div>
            ) : (
              products.map(product => (
                <div key={product._id} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Product main image */}
                    <div className="w-full md:w-64 flex-shrink-0">
                      {product.mainImages?.[0] ? (
                        <div className="relative aspect-square rounded-md overflow-hidden border border-gray-700">
                          <Image
                            src={urlFor(product.mainImages[0]).url()}
                            alt={product.mainImages[0]?.alt || product.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 256px"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-gray-800 rounded-md border border-gray-700">
                          <ImageIcon className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg text-white">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                            <span>SKU: {product._id.slice(-6).toUpperCase()}</span>
                            {product.sizeGuide?.active && (
                              <Badge variant="outline" className="flex items-center gap-1 bg-gray-800 text-gray-300 border-gray-700">
                                <Ruler className="h-3 w-3" />
                                {product.sizeGuide.title}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-gray-800 text-white border-gray-700">
                          Total: {product.availableQuantity}
                        </Badge>
                      </div>

                      {product.colors && product.colors.length > 0 ? (
                        <div className="mt-4 space-y-4">
                          {product.colors.map((color, index) => (
                            <div key={`${product._id}-${color.name}-${index}`} className="p-4 bg-gray-800 rounded-md">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Color image */}
                                <div className="flex-shrink-0">
                                  {color.images?.[0] ? (
                                    <div className="w-24 h-24 relative rounded-md overflow-hidden border border-gray-700">
                                      <Image
                                        src={urlFor(color.images[0]).url()}
                                        alt={color.images[0]?.alt || `${product.title} - ${color.name}`}
                                        fill
                                        priority
                                        className="object-cover"
                                        sizes="96px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-24 h-24 flex items-center justify-center bg-gray-700 rounded-md border border-gray-600">
                                      <ImageIcon className="h-8 w-8 text-gray-500" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-5 h-5 rounded-full border border-gray-600"
                                      style={{ backgroundColor: color.color.hex }}
                                    />
                                    <span className="font-medium text-white">{color.name}</span>
                                    <Badge variant="outline" className="ml-auto bg-gray-700 text-white border-gray-600">
                                      Qty: {color.quantity}
                                    </Badge>
                                  </div>

                                  {color.sizes && color.sizes.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <div className="text-sm text-gray-300">Size breakdown:</div>
                                      <div className="flex flex-wrap gap-2">
                                        {color.sizes.map(size => (
                                          <div 
                                            key={`${product._id}-${color.name}-${size.size}`}
                                            className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-md text-sm text-white"
                                          >
                                            <span>{size.size}</span>
                                            <Separator orientation="vertical" className="h-4 bg-gray-600" />
                                            <span className="font-medium">{size.quantity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-gray-300 flex items-center gap-2 p-3 bg-gray-800 rounded-md">
                          <Palette className="h-4 w-4" />
                          No color variants available
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator className="bg-gray-800" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}