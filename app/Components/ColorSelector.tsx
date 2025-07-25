'use client';

import { X } from 'lucide-react';
import type { ColorVariant } from './interface';

interface ColorSelectorProps {
  colors: ColorVariant[];
  currentColor: string;
  onColorSelect: (colorId: string) => void;
}

export function ColorSelector({ colors, currentColor, onColorSelect }: ColorSelectorProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-100 mb-2">Colors:</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSoldOut = color.sizes?.every(size => size.quantity <= 0);
          return (
            <button
              key={color._key}
              onClick={() => !isSoldOut && onColorSelect(color._key)}
              style={{ backgroundColor: color.color.hex }}
              className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                currentColor === color._key
                  ? 'border-black scale-110'
                  : 'border-gray-200 hover:border-gray-400'
              } ${isSoldOut ? 'opacity-50' : ''}`}
              title={`${color.name}${isSoldOut ? ' (Sold Out)' : ''}`}
              disabled={isSoldOut}
            >
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <X className="w-4 h-4 text-white stroke-2" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}