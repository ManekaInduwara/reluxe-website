'use client';

import { X } from 'lucide-react';

interface SizeSelectorProps {
  sizes: Array<{ size: string; quantity: number }>;
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSizeSelect }: SizeSelectorProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-100 mb-2">Sizes</h3>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isAvailable = size.quantity > 0;
          const isSelected = size.size === selectedSize;
          
          return (
            <button
              key={size.size}
              onClick={() => isAvailable && onSizeSelect(size.size)}
              className={`
                w-12 h-12 flex items-center justify-center 
                rounded-full border-2 text-sm font-medium
                transition-all duration-200
                ${
                  !isAvailable
                    ? 'bg-black text-gray-400 border-gray-200 cursor-not-allowed'
                    : isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-500'
                }
                relative
              `}
              disabled={!isAvailable}
              title={!isAvailable ? 'Sold Out' : `${size.quantity} available`}
            >
              {size.size}
              {!isAvailable && (
                <X className="absolute w-full h-full text-red-500" strokeWidth={1} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}