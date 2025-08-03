import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Search, Filter } from 'lucide-react';

// Mock data for planners
const mockPlanners = [
  {
    id: '1',
    business_name: "Kölner Festkultur",
    latitude: 50.9375,
    longitude: 6.9603,
    location_city: "Cologne",
    location_state: "NRW",
    average_rating: 4.9,
    base_price: 2500,
    description: "Creating magical moments in the heart of Cologne",
    specialties: ["Weddings", "Corporate", "Birthday"]
  },
  {
    id: '2',
    business_name: "Bonner Eventmanagement",
    latitude: 50.7374,
    longitude: 7.0982,
    location_city: "Bonn",
    location_state: "NRW",
    average_rating: 4.8,
    base_price: 1800,
    description: "Turning your dreams into unforgettable celebrations in Bonn",
    specialties: ["Birthday", "Kids Parties", "Themes"]
  },
  {
    id: '3',
    business_name: "Düsseldorf Elite Events",
    latitude: 51.2277,
    longitude: 6.7735,
    location_city: "Düsseldorf",
    location_state: "NRW",
    average_rating: 5.0,
    base_price: 3500,
    description: "Luxury party planning in Düsseldorf with attention to every detail",
    specialties: ["Luxury", "Corporate", "Galas"]
  }
];

export default function PlannersPage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedPlanner, setSelectedPlanner] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const handlePlannerSelect = (plannerId: string) => {
    setSelectedPlanner(plannerId);
  };

  const filteredPlanners = mockPlanners.filter(planner =>
    searchLocation === '' || 
    planner.location_city.toLowerCase().includes(searchLocation.toLowerCase()) ||
    planner.location_state.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Party Planners</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing party planners in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter city or state..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPlanners.map((planner) => (
              <Card 
                key={planner.id} 
                className={`overflow-hidden hover:shadow-party transition-party hover-bounce cursor-pointer ${
                  selectedPlanner === planner.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePlannerSelect(planner.id)}
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-party">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                    {planner.business_name.charAt(0)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary shadow-sm">
                      ${planner.base_price}+
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{planner.business_name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {planner.location_city}, {planner.location_state}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{planner.average_rating}</span>
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
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        {filteredPlanners.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No planners found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or location
            </p>
          </div>
        )}
      </div>
    </div>
  );
}