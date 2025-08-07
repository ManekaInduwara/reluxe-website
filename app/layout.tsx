import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./Components/Navbar";
import { CartProvider } from "./Context/CartContext";
import CartDisplay from "./Components/CartDisplay";
import { ClerkProvider } from "@clerk/nextjs";
import NewsletterPopup from "./Components/NewsletterPopup";
import Footer from "./Components/Footer";
import GsapScroll from "./Components/GsapScroll";
import { Toaster } from 'sonner'
import CustomCursor from "./Components/CustomCursor";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Reluxe Store",
  description: "Elevate Every Look",
};

import ClientLayout from "./Components/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Check if Clerk is properly configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            html {
              scroll-behavior: smooth;
            }
            /* Custom smooth scroll effect */
            @media (prefers-reduced-motion: no-preference) {
              html {
                scroll-behavior: smooth;
              }
              /* Luxury scrollbar styling */
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              ::-webkit-scrollbar-track {
                background: #0a0a0a;
              }
              ::-webkit-scrollbar-thumb {
                background: #b91c1c;
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #991b1b;
              }
              /* Custom scroll snap for sections */
              .snap-section {
                scroll-snap-align: start;
                scroll-margin-top: 80px; /* Adjust for fixed header */
              }
            }
          `
        }} />
      </head>
      <body className={`${poppins.variable} antialiased bg-black text-white`}>
        {clerkPublishableKey ? (
          <ClerkProvider
            publishableKey={clerkPublishableKey}
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#b91c1c',
                colorBackground: '#0a0a0a',
                colorText: '#ffffff',
                colorTextSecondary: '#9ca3af',
                colorInputBackground: '#1f2937',
                colorInputText: '#ffffff',
              },
            }}
          >
             <GsapScroll>
                <Toaster 
                  richColors 
                  position="top-right" 
                  toastOptions={{
                    style: {
                      background: '#0a0a0a',
                      border: '1px solid #262626',
                      color: '#f5f5f5',
                      fontFamily: 'var(--font-poppins)'
                    }
                  }} 
                />
            
                <CartProvider>
                 <ClientLayout>
                  <main className="min-h-screen">
                    {children}
                  </main>
                  </ClientLayout>
              
                </CartProvider>

              </GsapScroll>
          </ClerkProvider>
        ) : (
          // Fallback when Clerk is not configured
          <GsapScroll>
            <Toaster 
              richColors 
              position="top-right" 
              toastOptions={{
                style: {
                  background: '#0a0a0a',
                  border: '1px solid #262626',
                  color: '#f5f5f5',
                  fontFamily: 'var(--font-poppins)'
                }
              }} 
            />
        
            <CartProvider>
             <ClientLayout>
              <main className="min-h-screen">
                {children}
              </main>
              </ClientLayout>
          
            </CartProvider>

          </GsapScroll>
        )}
      </body>
    </html>
  );
}
