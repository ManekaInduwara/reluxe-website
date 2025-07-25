'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export default function RateProduct({ productId, ratings }: { productId: string; ratings: number[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const averageRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '0.0'

  const handleRate = async (value: number) => {
    setSelected(value)
    setSubmitting(true)

    await fetch('/api/rate', {
      method: 'POST',
      body: JSON.stringify({ productId, rating: value }),
      headers: { 'Content-Type': 'application/json' }
    })

    setSubmitting(false)
    alert('Thank you for your rating!')
  }

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={submitting}
            className={`p-1 ${selected && star <= selected ? 'text-yellow-400' : 'text-gray-400'}`}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400">
        Avg: <span className="font-semibold text-white">{averageRating}</span> ({ratings.length})
      </p>
    </div>
  )
}
