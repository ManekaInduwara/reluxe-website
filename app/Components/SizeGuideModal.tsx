
'use client'

import { useState, useMemo } from 'react'
import { ProductSizeGuide } from './interface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { RulerDimensionLine } from 'lucide-react'

interface SizeGuidePopupProps {
  sizeGuide?: ProductSizeGuide
  buttonText?: string
  className?: string
}

export function SizeGuidePopup({
  sizeGuide,
  buttonText = 'Size Guide',
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
          value: convertMeasurement(size.value, unit)
        }))
      }
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
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-sm gap-2 bg-black"
      >
        {buttonText}
        <RulerDimensionLine className='w-4 h-4'/>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white">
          <DialogHeader>
            <DialogTitle>{sizeGuide.title || 'Size Guide'}</DialogTitle>
            {sizeGuide.description && (
              <DialogDescription>{sizeGuide.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {sizeGuide.measurementImage && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={urlFor(sizeGuide.measurementImage).url()}
                  alt={sizeGuide.measurementImage.alt || 'Measurement diagram'}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex items-center space-x-4 bg-black text-white">
              <Label>Measurement Units:</Label>
              <ToggleGroup 
                type="single" 
                value={unit}
                onValueChange={(value: 'in' | 'cm') => setUnit(value)}
              >
                <ToggleGroupItem value="in" aria-label="Toggle inches">
                  Inches
                </ToggleGroupItem>
                <ToggleGroupItem value="cm" aria-label="Toggle centimeters">
                  Centimeters
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="rounded-md border bg-black text-amber-50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-white'>Measurement</TableHead>
                    {sizeLabels.map((label, index) => (
                      <TableHead key={index} className="text-center text-amber-50">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convertedChart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-amber-50">
                        <div>{item.region}</div>
                        {item.measurement && (
                          <div className="text-xs text-muted-foreground mt-1 text-amber-50">
                            {item.measurement}
                          </div>
                        )}
                      </TableCell>
                      {sizeLabels.map((label, i) => {
                        const value = sizeGuide.chartType === 'custom' 
                          ? item.values.customSizes?.[i]?.value
                          : item.values[label as keyof typeof item.values]
                        return (
                          <TableCell key={i} className="text-center">
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
              <div className="space-y-2">
                {sizeGuide.fitNotes && (
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800">Fit Note</h4>
                    <p className="text-sm text-blue-700">{sizeGuide.fitNotes}</p>
                  </div>
                )}
                {sizeGuide.disclaimer && (
                  <p className="text-xs text-muted-foreground">{sizeGuide.disclaimer}</p>
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
  }
  else if (toUnit === 'in' && /cm\b/i.test(value)) {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      const inches = numValue / 2.54
      return `${inches.toFixed(1)} in`
    }
  }
  return value
}