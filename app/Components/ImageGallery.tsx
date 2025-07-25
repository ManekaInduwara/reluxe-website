'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import type { ColorVariant, SanityImage } from './interface';

interface ImageGalleryProps {
  colors: ColorVariant[];
  title: string;
  mainImages: SanityImage[];
  selectedColorKey?: string; // Add this prop
}

export default function ImageGallery({ 
  colors, 
  title, 
  mainImages,
  selectedColorKey 
}: ImageGalleryProps) {
  // Get images for the selected color
  const selectedColorImages = selectedColorKey 
    ? colors.find(c => c._key === selectedColorKey)?.images || []
    : [];

  // Combine main images with selected color images
  const displayImages = selectedColorKey 
    ? selectedColorImages 
    : mainImages;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const currentImage = displayImages[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Reset to first image when color changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedColorKey]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        {...swipeHandlers}
        className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden cursor-zoom-in"
        onClick={() => setModalOpen(true)}
      >
        {currentImage && (
          <Image
            src={currentImage.asset.url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            priority
          />
        )}

        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black p-2 rounded-full shadow-md hover:bg-white"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 p-2 rounded-full shadow-md hover:bg-black/75"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                idx === currentIndex ? 'border-black' : 'border-transparent'
              }`}
            >
              <Image
                src={img.asset.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {modalOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.asset.url}
              alt="Zoomed"
              fill
              className="object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/75"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}