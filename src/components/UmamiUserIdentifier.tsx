'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

declare global {
  interface Window {
    umami?: {
      identify: (userId: string, data?: Record<string, any>) => void;
    };
  }
}

export default function UmamiUserIdentifier() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && window.umami) {
      // Identify the user with their Google email
      window.umami.identify(session.user.email, {
        email: session.user.email,
        name: session.user.name,
        provider: 'google'
      });
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}
