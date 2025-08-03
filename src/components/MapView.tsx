import React from 'react';
import { MapPin, Star, Euro } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  planners?: Array<{
    id: string;
    business_name: string;
    latitude?: number;
    longitude?: number;
    location_city?: string;
    location_state?: string;
    average_rating?: number;
    base_price?: number;
  }>;
  onPlannerSelect?: (plannerId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ planners = [], onPlannerSelect }) => {
  console.log('MapView rendering with planners:', planners);
  
  // Filter planners that have coordinates (proper number check)
  const plannersWithCoords = planners.filter(
    planner => typeof planner.latitude === 'number' && typeof planner.longitude === 'number'
  );

  // Calculate center of map based on planners or default to Germany center
  const center: [number, number] = plannersWithCoords.length > 0
    ? [
        plannersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / plannersWithCoords.length,
        plannersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / plannersWithCoords.length
      ]
    : [51.1657, 10.4515]; // Center of Germany

  console.log('Center calculated:', center);
  console.log('Planners with coords:', plannersWithCoords);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-gradient-to-br from-blue-50 to-green-50" style={{ height: '400px' }}>
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Party Planners Map</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {plannersWithCoords.length} planners in Germany
            {plannersWithCoords.length > 0 && (
              <span className="ml-2">
                • Center: {center[0].toFixed(2)}°N, {center[1].toFixed(2)}°E
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Planners List */}
      {plannersWithCoords.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Locations Available</h3>
            <p className="text-muted-foreground">No planner locations to display on the map</p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="grid gap-3 max-h-48 overflow-y-auto">
            {plannersWithCoords.map((planner, index) => (
              <Card 
                key={planner.id}
                className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => {
                  console.log('Planner clicked:', planner.id);
                  onPlannerSelect?.(planner.id);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        {planner.business_name}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {planner.location_city}, {planner.location_state}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {planner.average_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{planner.average_rating}</span>
                        </div>
                      )}
                      {planner.base_price && (
                        <Badge variant="secondary" className="text-xs">
                          €{planner.base_price}+
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      📍 {planner.latitude?.toFixed(4)}, {planner.longitude?.toFixed(4)}
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Decorative Map Elements */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6B7280" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Location Pins on Background */}
      {plannersWithCoords.map((planner, index) => (
        <div
          key={`pin-${planner.id}`}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{
            left: `${20 + (index * 25)}%`,
            top: `${30 + (index * 15)}%`,
          }}
        >
          <div className="relative">
            <MapPin className="w-8 h-8 text-primary drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapView;