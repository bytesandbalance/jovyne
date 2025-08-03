import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Search, 
  Filter,
  ArrowRight,
  PartyPopper,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const { user } = useAuthContext();
  const [searchLocation, setSearchLocation] = useState('');

  // Mock data for featured planners
  const featuredPlanners = [
    {
      id: 1,
      name: "Kölner Festkultur",
      description: "Creating magical moments in the heart of Cologne",
      location: "Cologne, Germany",
      rating: 4.9,
      reviews: 127,
      price: "€2,500+",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      specialties: ["Weddings", "Corporate", "Birthday"]
    },
    {
      id: 2,
      name: "Bonner Eventmanagement",
      description: "Turning your dreams into unforgettable celebrations in Bonn",
      location: "Bonn, Germany",
      rating: 4.8,
      reviews: 89,
      price: "€1,800+",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop",
      specialties: ["Birthday", "Kids Parties", "Themes"]
    },
    {
      id: 3,
      name: "Düsseldorf Elite Events",
      description: "Luxury party planning in Düsseldorf with attention to every detail",
      location: "Düsseldorf, Germany",
      rating: 5.0,
      reviews: 67,
      price: "€3,500+",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
      specialties: ["Luxury", "Corporate", "Galas"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 gradient-party">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <PartyPopper className="w-5 h-5" />
              <span className="text-sm font-medium">Welcome to PartyPlatform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Perfect
              <br />
              <span className="relative">
                Party Planners
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300" />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Discover amazing party planners near you, plan unforgettable events, 
              and connect with talented helpers for any celebration
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-4 p-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-party">
                <div className="flex-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground ml-4" />
                   <Input
                    placeholder="Enter your city or zip code..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-lg text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Link to="/planners">
                  <Button size="lg" className="rounded-xl hover-bounce">
                    <Search className="w-5 h-5 mr-2" />
                    Find Planners
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {!user && (
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="hover-bounce">
                    Join the Platform
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Planners */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Party Planners</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover top-rated party planners who will make your celebration extraordinary
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredPlanners.map((planner) => (
              <Card key={planner.id} className="overflow-hidden hover:shadow-party transition-party hover-bounce cursor-pointer">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={planner.image} 
                    alt={planner.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary shadow-sm">
                      {planner.price}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{planner.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {planner.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{planner.rating}</span>
                      <span className="text-sm text-muted-foreground">({planner.reviews})</span>
                    </div>
                  </div>
                  <CardDescription>{planner.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {planner.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full hover-bounce">
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/planners">
              <Button size="lg" variant="outline" className="hover-bounce">
                <Search className="w-5 h-5 mr-2" />
                Browse All Planners
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How PartyPlatform Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to your perfect party
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-party flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Discover</h3>
              <p className="text-muted-foreground">
                Browse party planners in your area, view their portfolios, and read reviews
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-sunset flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Plan</h3>
              <p className="text-muted-foreground">
                Connect with planners, share your vision, and collaborate on every detail
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-celebration flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Celebrate</h3>
              <p className="text-muted-foreground">
                Enjoy your perfectly planned event while we handle all the details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-16 px-4 gradient-ocean">
          <div className="container mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Planning?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of happy customers who found their perfect party planner
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="hover-bounce">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Client
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover-bounce">
                  <Calendar className="w-5 h-5 mr-2" />
                  Become a Planner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}