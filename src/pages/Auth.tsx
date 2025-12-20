import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Shield } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code && !processingCallback) {
      handleEntraCallback(code);
    }
  }, [searchParams]);

  const handleEntraCallback = async (code: string) => {
    setProcessingCallback(true);
    try {
      const redirectUri = `${window.location.origin}/auth`;

      const { data, error } = await supabase.functions.invoke('entra-auth', {
        body: {
          action: 'exchange-code',
          code,
          redirectUri,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.magicLink) {
        // Redirect to magic link to complete authentication
        window.location.href = data.magicLink;
      } else {
        toast({
          title: 'Authentication successful',
          description: `Welcome, ${data.user.name}!`,
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Callback error:', error);
      toast({
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Failed to complete sign in',
        variant: 'destructive',
      });
      // Clear the URL params
      navigate('/auth', { replace: true });
    } finally {
      setProcessingCallback(false);
    }
  };

  const handleEntraLogin = async () => {
    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth`;

      const { data, error } = await supabase.functions.invoke('entra-auth', {
        body: {
          action: 'get-auth-url',
          redirectUri,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to Entra ID login
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Failed to initiate login',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (processingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'var(--gradient-glow)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--gradient-glow)' }}
        />
      </div>

      <Card className="w-full max-w-md glass-card animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">CloudOps Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in with your organization account to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleEntraLogin}
            disabled={loading}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Your access level will be determined by your organization's group membership</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}