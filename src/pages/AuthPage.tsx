import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Sparkles, PartyPopper, Users, Calendar } from 'lucide-react';

export default function AuthPage() {
  const { user, signIn, signUp } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState<string>('client');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
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
            Jovyne
          </h1>
          <p className="text-white/80 text-lg">
            Where celebrations come to life! 🎉
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-party border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Join the Party!' : 'Welcome Back!'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Create your account to start planning amazing events'
                : 'Sign in to continue your party planning journey'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
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
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full hover-bounce"
                disabled={loading}
              >
                {loading ? 'Loading...' : (isSignUp ? 'Start Partying! 🎊' : 'Sign In 🎉')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}