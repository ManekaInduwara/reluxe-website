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
}

export function ColorSelector({ 
  colors = [], 
  currentColor, 
  onColorSelect,
  className 
}: ColorSelectorProps) {
  // Safe color access with fallbacks
  const getColorHex = (color: ColorVariant) => {
    return color?.color?.hex || '#cccccc';
  };

  // Early return if no colors available
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
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const hexColor = getColorHex(color);
          const isSelected = currentColor === color._key;
          const isSoldOut = color.sizes?.every(size => size.quantity <= 0) ?? false;

          return (
            <motion.button
              key={color._key}
              whileHover={!isSoldOut ? { scale: 1.1 } : {}}
              whileTap={!isSoldOut ? { scale: 0.95 } : {}}
              onClick={() => !isSoldOut && onColorSelect(color._key)}
              style={{ backgroundColor: hexColor }}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all relative",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white",
                isSelected 
                  ? 'border-white scale-110 shadow-lg' 
                  : 'border-gray-700 hover:border-gray-400',
                isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              )}
              title={`${color.name || 'Color'}${isSoldOut ? ' (Sold Out)' : ''}`}
              disabled={isSoldOut}
              aria-label={`${color.name || 'Color'}${isSoldOut ? ' Sold Out' : ''}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-white"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </motion.div>
              )}

              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <X className="w-4 h-4 text-white stroke-[3px]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}