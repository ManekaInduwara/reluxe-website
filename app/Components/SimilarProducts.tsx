'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import StockAlert from './Quantity';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';

gsap.registerPlugin(ScrollTrigger);

interface Product {
  _id: string;
  title: string;
  price: number;
  slug: string;
  categoryName: string;
  discount: number;
  imageUrl: string;
  availableQuantity: number;
  rating?: number;
  ratings?: number[];
}

interface SimilarProductsProps {
  currentProductId: string;
  categoryId: string; // Pass the category ID instead of name
}

export default function SimilarProducts({ 
  currentProductId, 
  categoryId
}: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [activeRatings, setActiveRatings] = useState<{[key: string]: number | null}>({});
  const router = useRouter();
  const { user } = useUser();
  
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        
        // First get category name
        const category = await client.fetch(
          `*[_type == "category" && _id == $categoryId][0]{
            name,
            "products": *[_type == "product" && references(^._id) && _id != $currentProductId] | order(_createdAt desc)[0...4] {
              _id,
              title,
              price,
              discount,
              "slug": slug.current,
              "imageUrl": mainImages[0].asset->url,
              availableQuantity,
              rating
            }
          }`,
          { categoryId, currentProductId }
        );

        if (category) {
          setCategoryName(category.name);
          setProducts(category.products || []);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSimilarProducts();
    }
  }, [categoryId, currentProductId]);

  useEffect(() => {
    if (products.length === 0 || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Section entrance
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=10%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        y: 80,
        duration: 1.2,
        ease: "power3.out"
      });

      // Heading animation
      if (headingRef.current) {
        gsap.from(headingRef.current.children, {
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top bottom-=15%",
            toggleActions: "play none none none"
          },
          opacity: 0,
          y: 40,
          stagger: 0.2,
          duration: 1,
          ease: "expo.out"
        });
      }

      // Product animations
      productRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        gsap.from(ref, {
          scrollTrigger: {
            trigger: ref,
            start: "top bottom-=10%",
            toggleActions: "play none none none"
          },
          opacity: 0,
          y: 60,
          duration: 0.8,
          delay: i * 0.1,
          ease: "back.out(1.2)"
        });

        // Hover animations
        ref.addEventListener('mouseenter', () => {
          gsap.to(ref, { scale: 1.02, duration: 0.3 });
          const image = ref.querySelector('.product-image');
          if (image) gsap.to(image, { scale: 1.05, duration: 0.5 });
        });
        
        ref.addEventListener('mouseleave', () => {
          gsap.to(ref, { scale: 1, duration: 0.3 });
          const image = ref.querySelector('.product-image');
          if (image) gsap.to(image, { scale: 1, duration: 0.5 });
        });
      });
    });

    return () => ctx.revert();
  }, [products]);

  const toggleQuickView = (id: string) => {
    setClickedId(prev => (prev === id ? null : id));
  };

  const handleRateProduct = async (productId: string, ratingValue: number) => {
    if (!user) {
      alert('Please sign in to rate products');
      return;
    }

    try {
      const ratingDoc = {
        _type: 'rating',
        productId,
        userId: user.id,
        value: ratingValue,
      };

      await client.create(ratingDoc);

      const ratings = await client.fetch(
        `*[_type == "rating" && productId == $productId]`,
        { productId }
      );

      const average = ratings.reduce((sum: number, rating: any) => sum + rating.value, 0) / ratings.length;

      await client
        .patch(productId)
        .set({
          rating: parseFloat(average.toFixed(1)),
          ratings: ratings.map((r: any) => r.value)
        })
        .commit();

      setActiveRatings(prev => ({
        ...prev,
        [productId]: ratingValue
      }));

      gsap.fromTo(`#rating-${productId}`, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
      );

    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (product: Product) => {
    const averageRating = product.rating || 0;
    const userRating = activeRatings[product._id] || null;

    return (
      <div id={`rating-${product._id}`} className="flex items-center gap-1 mt-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRateProduct(product._id, star)}
              className="focus:outline-none transform hover:scale-125 transition-transform duration-150"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  star <= (userRating || averageRating)
                    ? 'text-white fill-white'
                    : 'text-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-1">
          {averageRating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="relative bg-black text-white py-16 px-4 sm:px-6 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-900 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render if no similar products
  }

  return (
    <section 
      ref={sectionRef}
      className="relative bg-black text-white py-16 px-4 sm:px-6 overflow-hidden"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div 
          ref={headingRef}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            More from {categoryName}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore similar products in this collection
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product._id}
              ref={el => { productRefs.current[index] = el; }}
              className="product-card relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 transition-all duration-300 hover:border-white/50 hover:shadow-xl hover:shadow-white/5"
              onClick={() => toggleQuickView(product._id)}
            >
              <Link href={`/product/${product.slug}`} className="block relative group">
                <div className="relative overflow-hidden aspect-square">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="product-image w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="product-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500"></div>
                  
                  {clickedId === product._id && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/product/${product.slug}`);
                      }}
                      className="quick-view-btn absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-black text-sm font-medium px-5 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
                    >
                      Quick View
                    </button>
                  )}

                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <h3 className="text-md font-semibold truncate group-hover:text-white transition-colors">
                  {product.title}
                </h3>

                {renderStars(product)}

                <div className="mt-3 flex justify-between items-center">
                  <div>
                    {product.discount > 0 ? (
                      <>
                        <p className="text-xs text-gray-500 line-through">
                          LKR{product.price.toFixed(2)}
                        </p>
                        <p className="text-lg font-bold text-white">
                          LKR{(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-white">
                        LKR{product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <StockAlert quantity={product.availableQuantity} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href={`/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`}
            className="relative px-6 py-2.5 border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              View All {categoryName}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          </Link>
        </div>
      </div>
    </section>
  );
}