'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import gsap from 'gsap'
import Image from 'next/image'
import reluxe from '@/app/reluxe_black.png'

function CountdownContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'
  const containerRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<SVGSVGElement>(null)

  const TARGET_DATE = new Date('2025-08-08T23:59:59Z').getTime()
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isComplete: false
  })

  const calculateTimeLeft = () => {
    const now = Date.now()
    const difference = TARGET_DATE - now

    if (difference <= 0) {
      return {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        isComplete: true
      }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
      seconds: Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, '0'),
      isComplete: false
    }
  }

  useEffect(() => {
    setTimeLeft(calculateTimeLeft())

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      })

      gsap.to(clockRef.current, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: 'none'
      })
    }, containerRef)

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft()
      setTimeLeft(newTime)

      if (newTime.isComplete) {
        clearInterval(timer)
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          onComplete: () => router.push(redirectPath)
        })
      }
    }, 1000)

    return () => {
      ctx.revert()
      clearInterval(timer)
    }
  }, [redirectPath, router])

  return (
    <div 
      ref={containerRef}
      className=" font-[family-name:var(--font-poppins)]  min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-gray-800 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-gray-700 blur-3xl"></div>
      </div>
 <Image src={reluxe} 
 width={500}
height={500}
alt={''} />

      <div className="max-w-md space-y-6 relative z-10">
        <div className="flex justify-center">
          
          <Clock 
        ref={clockRef}
        className="h-16 w-16 text-gray-300" 
          />
        </div>

        <h1 className="text-4xl font-bold">Coming Soon</h1>

        <p className="text-lg text-gray-400">
          We're preparing something amazing!
        </p>

        <div className="grid grid-cols-4 gap-4 pt-6">
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
        <span className="text-3xl font-bold text-white">{timeLeft.days}</span>
        <span className="text-xs mt-1 text-gray-400">DAYS</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
        <span className="text-3xl font-bold text-white">{timeLeft.hours}</span>
        <span className="text-xs mt-1 text-gray-400">HOURS</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
        <span className="text-3xl font-bold text-white">{timeLeft.minutes}</span>
        <span className="text-xs mt-1 text-gray-400">MINUTES</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
        <span className="text-3xl font-bold text-white">{timeLeft.seconds}</span>
        <span className="text-xs mt-1 text-gray-400">SECONDS</span>
          </div>
        </div>

        <div className="pt-8">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gray-300 rounded-full"
          style={{ 
            width: `${timeLeft.isComplete ? 100 : 100 - (parseInt(timeLeft.days) / 365 * 100)}%`
          }}
        />
          </div>
          <p className="text-sm text-gray-400 mt-4">
        Launching on {new Date(TARGET_DATE).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

function CountdownFallback() {
  return (
    <div className="font-[family-name:var(--font-poppins)] min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-gray-800 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-gray-700 blur-3xl"></div>
      </div>
      <Image src={reluxe} width={500} height={500} alt={''} />
      <div className="max-w-md space-y-6 relative z-10">
        <div className="flex justify-center">
          <Clock className="h-16 w-16 text-gray-300" />
        </div>
        <h1 className="text-4xl font-bold">Coming Soon</h1>
        <p className="text-lg text-gray-400">We're preparing something amazing!</p>
        <div className="grid grid-cols-4 gap-4 pt-6">
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
            <span className="text-3xl font-bold text-white">--</span>
            <span className="text-xs mt-1 text-gray-400">DAYS</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
            <span className="text-3xl font-bold text-white">--</span>
            <span className="text-xs mt-1 text-gray-400">HOURS</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
            <span className="text-3xl font-bold text-white">--</span>
            <span className="text-xs mt-1 text-gray-400">MINUTES</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
            <span className="text-3xl font-bold text-white">--</span>
            <span className="text-xs mt-1 text-gray-400">SECONDS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CountdownPage() {
  return (
    <Suspense fallback={<CountdownFallback />}>
      <CountdownContent />
    </Suspense>
  )
}
