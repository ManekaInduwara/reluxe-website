// components/ReadMore.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ReadMoreProps {
  text: string
  maxLength?: number
  className?: string
}

export function ReadMore({ text, maxLength = 150, className = '' }: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      setNeedsTruncation(text.length > maxLength)
    }
  }, [text, maxLength])

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const displayText = isExpanded || !needsTruncation 
    ? text 
    : `${text.substring(0, maxLength)}...`

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={textRef}
        className="prose text-gray-200"
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
      
      {needsTruncation && (
        <button
          onClick={toggleExpand}
          className="flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          aria-label={isExpanded ? "Read less" : "Read more"}
        >
          {isExpanded ? (
            <>
              <span>Read less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Read more</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}