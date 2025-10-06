'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    umami?: {
      identify: (userId: string, data?: Record<string, any>) => void;
      track: (event: string, data?: Record<string, any>) => void;
    };
  }
}

export default function UmamiUserIdentifier() {
  const { data: session, status } = useSession();
  const hasIdentified = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const identifyUser = () => {
    if (
      status === 'authenticated' && 
      session?.user?.email && 
      window.umami && 
      !hasIdentified.current
    ) {
      try {
        // Identify the user with their Google email
        window.umami.identify(session.user.email, {
          email: session.user.email,
          name: session.user.name,
          provider: 'google'
        });
        hasIdentified.current = true;
        
        // Clear any pending retry
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } catch (error) {
        console.warn('Failed to identify user with Umami:', error);
        // Retry after a short delay
        retryTimeoutRef.current = setTimeout(() => {
          hasIdentified.current = false;
          identifyUser();
        }, 1000);
      }
    }
  };

  useEffect(() => {
    // Wait for Umami to be available
    const checkUmami = () => {
      if (window.umami) {
        identifyUser();
      } else {
        // Retry after a short delay if Umami isn't ready
        retryTimeoutRef.current = setTimeout(checkUmami, 100);
      }
    };

    // Start checking for Umami availability
    checkUmami();

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [session, status]);

  // Reset identification flag when session changes
  useEffect(() => {
    hasIdentified.current = false;
  }, [session?.user?.email]);

  return null; // This component doesn't render anything
}
