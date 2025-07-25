'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import {
  Instagram,
  Twitter,
  Facebook,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Heart,
  ArrowRight,
  MoveRight
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Three.js scene for floating particles
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
    
    const initThreeJS = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasRef.current!.appendChild(renderer.domElement);

      // Create particles
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 150;
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      camera.position.z = 5;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = canvasRef.current!.offsetWidth / canvasRef.current!.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvasRef.current?.removeChild(renderer.domElement);
      };
    };

    initThreeJS();

    // GSAP Animations
    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top bottom",
        toggleActions: "play none none none"
      }
    });

    // Floating glow animations
    gsap.to(glow1Ref.current, {
      x: 60,
      y: 40,
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(glow2Ref.current, {
      x: -50,
      y: -30,
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Logo animation
    gsap.from(logoRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)"
    });

    // Newsletter section animation
    masterTL.from(newsletterRef.current, {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out"
    });

    // Column stagger animation
    masterTL.from(".footer-column", {
      y: 80,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=1");

    // Bottom footer animation
    masterTL.from(".footer-bottom", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.6");

    // Link hover animations
    gsap.utils.toArray(".footer-link").forEach((link: any) => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, {
          x: 8,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(link.querySelector('svg'), {
          x: 5,
          opacity: 1,
          duration: 0.3
        });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          x: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)"
        });
        gsap.to(link.querySelector('svg'), {
          x: 0,
          opacity: 0,
          duration: 0.3
        });
      });
    });

    // Social icon hover effects
    gsap.utils.toArray(".social-icon").forEach((icon: any) => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          y: -5,
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(icon.querySelector('.social-icon-bg'), {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        });
      });
      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)"
        });
        gsap.to(icon.querySelector('.social-icon-bg'), {
          scale: 0,
          opacity: 0,
          duration: 0.3
        });
      });
    });

    return () => {
      masterTL.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const socialLinks = [
    { icon: <Instagram size={18} />, url: "#" },
    { icon: <FaWhatsapp size={18} />, url: "#" },
    { icon: <Facebook size={18} />, url: "#" },
  ];

  return (
    <footer ref={footerRef} className="relative bg-black text-gray-300 overflow-hidden font-[family-name:var(--font-poppins)] ">
      {/* 3D Particle Background */}
      <div ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></div>
      
      {/* Animated glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div ref={glow1Ref} className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-red-900/15 to-transparent blur-[100px]"></div>
        <div ref={glow2Ref} className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-gradient-to-tl from-red-700/20 to-transparent blur-[120px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-28">
        {/* Ultra-Premium Newsletter Section */}
        <div ref={newsletterRef} className="relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 backdrop-blur-xl rounded-3xl p-10 mb-24 border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_var(--shimmer-angle),transparent_0%,#ffffff10_20%,transparent_60%)] animate-[shimmer_8s_linear_infinite]"
              style={{"--shimmer-angle": "0deg"} as React.CSSProperties}
            ></div>
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                The Reluxe Circle
              </span>
            </h2>
            <p className="text-gray-400 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Join our exclusive membership for private sales, limited editions, and VIP experiences curated for our most discerning clients.
            </p>
            <div className="relative max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-neutral-900/80 border-2 border-neutral-800 rounded-full px-8 py-5 text-gray-200 focus:outline-none focus:border-red-600/50 placeholder-gray-500/70 text-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-700 text-white p-3 rounded-full hover:scale-110 transition-transform duration-300 hover:shadow-xl hover:shadow-red-500/30 group">
                <MoveRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="footer-column">
            <Link 
              ref={logoRef}
              href="/" 
              className="text-4xl font-bold text-white mb-8 inline-block hover:text-red-500 transition-colors duration-500"
            >
              RELUXE
            </Link>
            <p className="text-gray-500 text-base mb-10 leading-relaxed">
              Where timeless elegance meets contemporary design. Crafted for those who appreciate the extraordinary.
            </p>
            <div className="flex space-x-5">
              {socialLinks.map((social, index) => (
                <Link 
                  key={index} 
                  href={social.url}
                  className="social-icon p-3 bg-neutral-900 rounded-full hover:bg-red-700/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="social-icon-bg absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-full scale-0 opacity-0"></div>
                  <span className="relative z-10">{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Explore Column */}
         

          {/* About Column */}
          <div className="footer-column">
            <h4 className="text-white font-medium text-base mb-8 uppercase tracking-wider">Our World</h4>
            <ul className="space-y-5">
              {['The Reluxe Story', 'Sustainability', 'Craftsmanship', 'Press'].map((item) => (
                <li key={item} className="footer-link">
                  <Link href="/about"
                   className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-3 group text-lg">
                    <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-column">
            <h4 className="text-white font-medium text-base mb-8 uppercase tracking-wider">Concierge</h4>
            <ul className="space-y-5 text-gray-400">
              <li className="footer-link flex items-start gap-4">
                <MapPin className="flex-shrink-0 mt-1" size={20} />
                <address className="not-italic text-lg leading-relaxed">
                  Mahwaththa, Naotunna,<br />
                  Kottegoda, Matara,<br />
                  Sri Lanka
                </address>
              </li>
              <li className="footer-link flex items-center gap-4 text-lg">
                <Phone size={20} />
                <a href="tel:+94728762428" className="hover:text-red-500 transition-colors">+94 (72) 876 2428</a>
              </li>
              <li className="footer-link flex items-center gap-4 text-lg">
                <Mail size={20} />
                <a href="mailto:contact@reluxe.store" className="hover:text-red-500 transition-colors">contact@reluxe.store</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom border-t border-neutral-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-start gap-3">
            <p className="text-gray-500 text-base">
              © {new Date().getFullYear()} Reluxe. All rights reserved.
            </p>
            <div 
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget.querySelector('svg'), { 
                  scale: 1.3,
                  duration: 0.4,
                  repeat: 1,
                  yoyo: true
                });
              }}
            >
              <span>Masterfully crafted by</span>
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              <span className="font-medium">Maneka Induwara</span>
            </div>
          </div>
          
        <div className="flex flex-wrap gap-6">
  {[
    { text: 'FAQ', href: '/faq' },
    { text: 'Refund Policy', href: '/refund-policy' },
    { text: 'Cookie Settings', href: '/cookie-settings' },
    { text: 'Accessibility', href: '/accessibility' }
  ].map((link) => (
    <Link 
      key={link.text}
      href={link.href}
      className="footer-link relative text-gray-500 hover:text-red-500 text-base transition-colors duration-300 overflow-hidden group"
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget.querySelector('.link-underline'), {
          scaleX: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(e.currentTarget.querySelector('.link-arrow'), {
          x: 5,
          opacity: 1,
          duration: 0.3
        });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget.querySelector('.link-underline'), {
          scaleX: 0,
          duration: 0.4,
          ease: "power2.out"
        });
        gsap.to(e.currentTarget.querySelector('.link-arrow'), {
          x: 0,
          opacity: 0,
          duration: 0.3
        });
      }}
    >
      <span className="relative inline-block">
        {link.text}
        <span className="link-underline absolute bottom-0 left-0 w-full h-px bg-red-500 origin-left scale-x-0"></span>
      </span>
      <ChevronRight className="link-arrow ml-1 w-4 h-4 opacity-0 inline-block" />
    </Link>
  ))}
</div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          from { --shimmer-angle: 0deg; }
          to { --shimmer-angle: 360deg; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;