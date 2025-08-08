'use client';

import { X } from 'lucide-react';
import type { ColorVariant } from './interface';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ColorSelectorProps {
  colors?: ColorVariant[];
  currentColor: string;
  onColorSelect: (colorId: string) => void;
  className?: string;
  showNames?: boolean;
}

export function ColorSelector({ 
  colors = [], 
  currentColor, 
  onColorSelect,
  className,
  showNames = true
}: ColorSelectorProps) {
  const getColorHex = (color: ColorVariant) => {
    return color?.color?.hex || '#cccccc';
  };

  const isLightColor = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  if (!colors || colors.length === 0) {
    return (
      <div className={cn("mt-4", className)}>
        <h3 className="text-sm font-medium text-gray-100 mb-2">Colors:</h3>
        <p className="text-sm text-gray-400">No colors available</p>
      </div>
    );
  }

  return (
    <div className={cn("mt-4", className)}>
      <h3 className="text-sm font-medium text-gray-100 mb-2">Colors:</h3>
      <div className="flex flex-wrap gap-4"> {/* Horizontal layout with gap */}
        {colors.map((color) => {
          const hexColor = getColorHex(color);
          const isSelected = currentColor === color._key;
          const isSoldOut = color.sizes?.every(size => size.quantity <= 0) ?? false;
          const isLight = isLightColor(hexColor);
          const isWhite = hexColor.toLowerCase() === '#ffffff';
          const borderColor = isSelected 
            ? (isLight ? 'border-gray-600' : 'border-white') 
            : (isLight ? 'border-gray-200' : 'border-gray-300');

          return (
            <div key={color._key} className="flex flex-col items-center gap-1"> {/* Vertical stack */}
              <motion.button
                whileHover={!isSoldOut ? { scale: 1.1 } : {}}
                whileTap={!isSoldOut ? { scale: 0.95 } : {}}
                onClick={() => !isSoldOut && onColorSelect(color._key)}
                style={{ backgroundColor: hexColor }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all relative", // Slightly larger swatches
                  borderColor,
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white",
                  isSelected ? 'scale-110 shadow-lg' : 'hover:border-gray-400',
                  isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
                disabled={isSoldOut}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={cn(
                        "w-5 h-5", // Slightly larger checkmark
                        isLight ? 'text-gray-800' : 'text-white',
                        isWhite && 'stroke-3'
                      )}
                      stroke="currentColor"
                      strokeWidth={isWhite ? 3 : 2}
                      fill="none"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </motion.div>
                )}
                {isSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className={cn(
                      "w-5 h-5", // Slightly larger X
                      isLight ? 'text-gray-800 stroke-[3px]' : 'text-white stroke-[3px]'
                    )} />
                  </div>
                )}
              </motion.button>

              {showNames && (
                <div className="flex flex-col items-center">
                  <span className={cn(
                    "text-xs text-center", // Smaller text
                    isSelected ? 'font-medium' : 'font-normal',
                    isLight ? 'text-gray-800' : 'text-gray-100',
                    isSoldOut && 'line-through opacity-75'
                  )}>
                    {color.name || 'Color'}
                  </span>
                  {isSoldOut && (
                    <span className="text-[10px] text-red-400">(Sold out)</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
