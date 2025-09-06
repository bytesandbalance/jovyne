import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Sparkles, PartyPopper, Users, Calendar } from 'lucide-react';

export default function AuthPage() {
  const { user, signIn, signUp, resetPassword } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState<string>('client');
  const [loading, setLoading] = useState(false);

  // Set sign-up mode based on URL parameter
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (showForgotPassword) {
      await resetPassword(email);
      setShowForgotPassword(false);
      setEmail('');
    } else if (isSignUp) {
      await signUp(email, password, { full_name: fullName, user_role: userRole });
    } else {
      await signIn(email, password);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-party flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Jovial
          </h1>
          <p className="text-white/80 text-lg">
            Where celebrations come to life! 🎉
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-party border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {showForgotPassword ? 'Reset Password' : (isSignUp ? 'Join the Party!' : 'Welcome Back!')}
            </CardTitle>
            <CardDescription>
              {showForgotPassword 
                ? 'Enter your email to receive a password reset link'
                : (isSignUp 
                  ? 'Create your account to start planning amazing events'
                  : 'Sign in to continue your party planning journey'
                )
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!showForgotPassword && isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">I want to...</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Plan parties for myself
                          </div>
                        </SelectItem>
                        <SelectItem value="planner">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Offer party planning services
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              {!showForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:text-primary/80 transition-party"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full hover-bounce"
                disabled={loading}
              >
                {loading ? 'Loading...' : (
                  showForgotPassword ? 'Send Reset Link 📧' : 
                  (isSignUp ? 'Start Partying! 🎊' : 'Sign In 🎉')
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              {!showForgotPassword && (
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:text-primary/80 transition-party"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Join the party!"
                  }
                </button>
              )}
              
              {showForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail('');
                  }}
                  className="text-primary hover:text-primary/80 transition-party"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}