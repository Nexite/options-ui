'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BarChart3 } from 'lucide-react';

/**
 * SignIn page component with modern design and shadcn/ui components
 * Features Google OAuth authentication with loading states and error handling
 */
export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  /**
   * Handles Google OAuth sign-in with loading and error states
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with theme toggle */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Options Analyzer</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to access your personalized options analysis dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              {/* <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Secure Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Fast Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span>Advanced Charts</span>
                </div>
              </div> */}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Sign in button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <LoadingButton loading={loading} className="gap-3">
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </LoadingButton>
              </Button>

              {/* Additional info */}
              {/* <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our terms of service and privacy policy
                </p>
              </div> */}
            </CardContent>
          </Card>

          {/* Footer info */}
          {/* <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs">
              🔒 Secure OAuth Authentication
            </Badge>
            <p className="text-xs text-muted-foreground">
              Your data is protected with industry-standard security measures
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
