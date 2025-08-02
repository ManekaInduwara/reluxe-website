'use client'

import { useEffect, useState, useRef } from 'react'

export default function AdvancedCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'active' | 'hidden'>('default')
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mouse movement tracker
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      
      // Detect background color at cursor position
      const element = document.elementFromPoint(e.clientX, e.clientY)
      if (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor
        const isDark = isColorDark(bgColor)
        setIsDarkBackground(isDark)
      }
    }

    // Cursor state handlers
    const handleMouseEnter = () => {
      document.documentElement.classList.add('has-advanced-cursor')
      setCursorState('default')
    }

    const handleMouseLeave = () => {
      document.documentElement.classList.remove('has-advanced-cursor')
      setCursorState('hidden')
    }

    const handleMouseDown = () => setCursorState('active')
    const handleMouseUp = () => setCursorState('default')

    // Interactive element detection
    const handleHoverEvents = () => {
      const hoverElements = document.querySelectorAll(
        'a, button, input, textarea, select, [data-cursor-hover]'
      )

      hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => setCursorState('hover'))
        el.addEventListener('mouseleave', () => setCursorState('default'))
      })
    }

    // Magnetic effect for special elements
    const handleMagneticElements = () => {
      const magneticElements = document.querySelectorAll('[data-cursor-magnetic]')
      
      magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          if (!cursorOutlineRef.current) return
          
          const rect = el.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          
          // Calculate distance from center
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
          const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
          
          // Apply magnetic effect
          if (distance < maxDistance * 0.5) {
            const angle = Math.atan2(y - centerY, x - centerX)
            const newX = centerX + Math.cos(angle) * distance * 0.5
            const newY = centerY + Math.sin(angle) * distance * 0.5
            
            cursorOutlineRef.current.style.transform = `translate(${newX + rect.left}px, ${newY + rect.top}px) scale(1.5)`
          }
        })
        
        el.addEventListener('mouseleave', () => {
          if (cursorOutlineRef.current) {
            cursorOutlineRef.current.style.transform = ''
          }
        })
      })
    }

    // Initialize
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    handleHoverEvents()
    handleMagneticElements()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Helper function to detect dark colors
  const isColorDark = (color: string): boolean => {
    if (!color || color === 'transparent') return true
    
    // Convert rgb/rgba to values
    const rgb = color.match(/\d+/g)
    if (!rgb) return true
    
    const r = parseInt(rgb[0])
    const g = parseInt(rgb[1])
    const b = parseInt(rgb[2])
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.5
  }

  // Cursor variants configuration
  const cursorVariants = {
    default: {
      dot: { size: 8, opacity: 1, scale: 1 },
      outline: { size: 40, opacity: 0.8, scale: 1 }
    },
    hover: {
      dot: { size: 4, opacity: 1, scale: 1.2 },
      outline: { size: 60, opacity: 1, scale: 1 }
    },
    active: {
      dot: { size: 10, opacity: 1, scale: 0.8 },
      outline: { size: 30, opacity: 1, scale: 1.2 }
    },
    hidden: {
      dot: { size: 8, opacity: 0, scale: 0.5 },
      outline: { size: 40, opacity: 0, scale: 0.5 }
    }
  }

  const currentVariant = cursorVariants[cursorState]
  const cursorColor = isDarkBackground ? 'white' : 'black'

  return (
    <>
      {/* Dot cursor */}
      <div 
        className="cursor-dot"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${currentVariant.dot.size}px`,
          height: `${currentVariant.dot.size}px`,
          opacity: currentVariant.dot.opacity,
          transform: `translate(-50%, -50%) scale(${currentVariant.dot.scale})`,
          backgroundColor: cursorColor,
        }}
      />
      
      {/* Outline cursor */}
      <div 
        ref={cursorOutlineRef}
        className="cursor-outline"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${currentVariant.outline.size}px`,
          height: `${currentVariant.outline.size}px`,
          opacity: currentVariant.outline.opacity,
          transform: `translate(-50%, -50%) scale(${currentVariant.outline.scale})`,
          borderColor: cursorColor,
        }}
      />
    </>
  )
}