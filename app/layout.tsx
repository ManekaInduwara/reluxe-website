import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./Components/Navbar";
import { CartProvider } from "./Context/CartContext";
import CartDisplay from "./Components/CartDisplay";
import { MotionConfig } from "framer-motion";
import { ClerkProvider } from "@clerk/nextjs";
import NewsletterPopup from "./Components/NewsletterPopup";
import Footer from "./Components/Footer";
import GsapScroll from "./Components/GsapScroll";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scrollbar-hide" lang="en">
      <body className={`${poppins.variable}`}>
        <ClerkProvider>
          <MotionConfig
            transition={{
              type: "spring",
              mass: 0.5,
              damping: 10,
              stiffness: 100,
              restDelta: 0.0001,
            }}
          >
            <GsapScroll>
              <Navbar />
              <CartProvider>
                <NewsletterPopup />
                {children}
                <CartDisplay />
              </CartProvider>
              <Footer />
            </GsapScroll>
          </MotionConfig>
        </ClerkProvider>
      </body>
    </html>
  );
}