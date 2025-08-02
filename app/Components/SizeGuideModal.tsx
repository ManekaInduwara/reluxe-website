'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Ruler } from 'lucide-react'
import { ProductSizeGuide } from './interface'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SizeGuidePopupProps {
  sizeGuide?: ProductSizeGuide
  buttonText?: string
  className?: string
}

export function SizeGuidePopup({
  sizeGuide,
  buttonText = 'SIZE GUIDE',
  className = '',
}: SizeGuidePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unit, setUnit] = useState<'in' | 'cm'>('in')

  if (!sizeGuide?.active || !sizeGuide.sizeChart?.length) return null

  const convertedChart = useMemo(() => {
    return sizeGuide.sizeChart.map(item => ({
      ...item,
      values: {
        ...item.values,
        XS: convertMeasurement(item.values.XS, unit),
        S: convertMeasurement(item.values.S, unit),
        M: convertMeasurement(item.values.M, unit),
        L: convertMeasurement(item.values.L, unit),
        XL: convertMeasurement(item.values.XL, unit),
        XXL: convertMeasurement(item.values.XXL, unit),
        customSizes: item.values.customSizes?.map(size => ({
          ...size,
          value: convertMeasurement(size.value, unit),
        })),
      },
    }))
  }, [sizeGuide.sizeChart, unit])

  const sizeLabels = useMemo(() => {
    if (sizeGuide.chartType === 'standard') return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    if (sizeGuide.chartType === 'alpha') return ['S', 'M', 'L']
    if (sizeGuide.chartType === 'custom') {
      return sizeGuide.sizeChart[0]?.values.customSizes?.map(size => size.label) || []
    }
    return ['28', '30', '32', '34', '36', '38', '40', '42']
  }, [sizeGuide])

  return (
    <div className={className}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="text-sm gap-2 border border-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
      >
        {buttonText}
        <Ruler className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white border border-gray-800 font-[family-name:var(--font-poppins)]">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-2xl font-light tracking-wider">
              {sizeGuide.title || 'SIZE GUIDE'}
            </DialogTitle>
            {sizeGuide.description && (
              <DialogDescription className="text-gray-400">
                {sizeGuide.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {sizeGuide.measurementImage && (
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <Image
                  src={urlFor(sizeGuide.measurementImage).url()}
                  alt={sizeGuide.measurementImage.alt || 'Measurement diagram'}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <Label className="text-gray-400">MEASUREMENT UNITS</Label>
              <Tabs
                value={unit}
                onValueChange={(value: 'in' | 'cm') => setUnit(value)}
                className="w-[180px]"
              >
                <TabsList className="bg-gray-900 border border-gray-800 text-white">
                  <TabsTrigger value="in" className="w-full text-white  data-[state=active]:text-black">IN</TabsTrigger>
                  <TabsTrigger value="cm" className="w-full text-white data-[state=active]:text-black">CM</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <Table className="border-collapse">
                <TableHeader className="bg-gray-900">
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-white font-medium py-4">MEASUREMENT</TableHead>
                    {sizeLabels.map((label, index) => (
                      <TableHead key={index} className="text-center text-white font-medium py-4">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convertedChart.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-800 last:border-b-0">
                      <TableCell className="font-medium py-4 text-white">
                        <div>{item.region}</div>
                        {item.measurement && (
                          <div className="text-xs text-gray-400 mt-1">
                            {item.measurement}
                          </div>
                        )}
                      </TableCell>
                      {sizeLabels.map((label, i) => {
                        const value =
                          sizeGuide.chartType === 'custom'
                            ? item.values.customSizes?.[i]?.value
                            : item.values[label as keyof typeof item.values]
                        return (
                          <TableCell key={i} className="text-center py-4 text-white">
                            {value || '-'}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {(sizeGuide.fitNotes || sizeGuide.disclaimer) && (
              <div className="space-y-3 font-[family-name:var(--font-poppins)]">
                {sizeGuide.fitNotes && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <h4 className="text-sm font-medium text-white mb-2">FIT NOTE</h4>
                    <p className="text-sm text-gray-300">{sizeGuide.fitNotes}</p>
                  </div>
                )}
                {sizeGuide.disclaimer && (
                  <p className="text-xs text-gray-500">{sizeGuide.disclaimer}</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function convertMeasurement(value?: string, toUnit: 'in' | 'cm'): string | undefined {
  if (!value) return undefined

  if (toUnit === 'cm' && (value.includes('"') || /in\b/i.test(value))) {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      const cm = numValue * 2.54
      return `${cm.toFixed(1)} cm`
    }
  } else if (toUnit === 'in' && /cm\b/i.test(value)) {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      const inches = numValue / 2.54
      return `${inches.toFixed(1)} in`
    }
  }

  return value
}
