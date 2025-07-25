'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import ScrollFloat from '@/Animations/ScrollFloat/ScrollFloat'
import TextPressure from '@/Animations/TextPressure/TextPressure'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

interface ImageBlock {
  _id: string
  image: any
}

export default function OurMissionPage() {
  const bgRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    const fetchImages = async () => {
      const data: ImageBlock[] = await client.fetch(`*[_type == "ourMissionImage"]{_id, image}`)
      const urls = data.map((item) => urlFor(item.image).url())
      setImages(urls)
    }
    fetchImages()
  }, [])

  const handleHover = (index: number) => {
    if (!images[index]) return
    setActiveImage(images[index])
    gsap.to(bgRef.current, { opacity: 0.4, duration: 0.6, ease: 'power2.out' })
  }

  const handleLeave = () => {
    gsap.to(bgRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' })
  }

  const paragraphs = [
    `At Reluxe, we believe luxury and minimalism can co-exist. Our mission is to redefine modern fashion by blending timeless design with premium materials — ensuring every piece feels as good as it looks.`,
    `Crafted with purpose and precision, every Reluxe product embodies sophistication, comfort, and authenticity. We're not just creating products; we're shaping a lifestyle for those who value subtle elegance.`,
    `Sustainability, quality, and customer satisfaction are at the heart of everything we do. Join us in building a community that appreciates slow fashion and timeless style.`
  ]

  return (
    <div className="relative bg-black text-white min-h-screen font-[family-name:var(--font-poppins)] overflow-hidden">
      
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-center bg-cover grayscale opacity-0 scale-105 transition-all duration-700 rounded-xl"
        style={{
          backgroundImage: activeImage ? `url(${activeImage})` : '',
          opacity: 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <TextPressure
    text="OUR MISSIONS!"
    flex={true}
    alpha={false}
    stroke={false}
    width={true}
    weight={true}
    italic={true}
    textColor="#ffffff"
    strokeColor="#ff0000"
    minFontSize={36}
  />
        <div className="space-y-16">
          {paragraphs.map((para, index) => (
            <div
              key={index}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={handleLeave}
              className="cursor-pointer"
            >
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
              >
                {para}
              </ScrollFloat>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
