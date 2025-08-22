'use client';

import { useEffect, useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  UserButton, 
  SignInButton, 
  SignUpButton 
} from '@clerk/nextjs';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

export function ClerkWrapper({ children }: ClerkWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration issues during SSR
  }

  return <>{children}</>;
}

export { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton };