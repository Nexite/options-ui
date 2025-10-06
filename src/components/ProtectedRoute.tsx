'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingState } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that wraps content requiring authentication
 * Redirects unauthenticated users to sign-in page
 * Shows loading state while checking authentication status
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimerRef = useRef<number | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Debounce the auth loader to avoid flashing on fast resolutions
  useEffect(() => {
    if (status === 'loading') {
      if (loaderTimerRef.current === null) {
        loaderTimerRef.current = window.setTimeout(() => setShowLoader(true), 150);
      }
    } else {
      if (loaderTimerRef.current !== null) {
        window.clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
      setShowLoader(false);
    }
    return () => {
      if (loaderTimerRef.current !== null) {
        window.clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, [status]);

  // Loading state
  if (status === 'loading' && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Authenticating..." size="xl" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return <>{children}</>;
}
