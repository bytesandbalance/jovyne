import React, { useState } from 'react';
import { MapPin, Star, Euro, ExternalLink } from 'lucide-react';
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
  const [selectedPlanner, setSelectedPlanner] = useState<string | null>(null);
  
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

  // Create markers parameter for OpenStreetMap
  const markersParam = plannersWithCoords.map((planner, index) => 
    `${planner.latitude},${planner.longitude}`
  ).join('|');

  // OpenStreetMap embed URL with markers
  const mapUrl = plannersWithCoords.length > 0 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${center[1]-0.5},${center[0]-0.3},${center[1]+0.5},${center[0]+0.3}&amp;layer=mapnik&amp;marker=${center[0]},${center[1]}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=5.9559,47.2702,15.0419,55.0584&amp;layer=mapnik`;

  const handlePlannerClick = (plannerId: string) => {
    setSelectedPlanner(plannerId);
    onPlannerSelect?.(plannerId);
  };

  const handleViewOnMap = (planner: any) => {
    const url = `https://www.openstreetmap.org/?mlat=${planner.latitude}&mlon=${planner.longitude}&zoom=15`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-background" style={{ height: '400px' }}>
      {/* Street Map */}
      <div className="relative w-full h-full">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title="Street Map"
          loading="lazy"
        />
        
        {/* Map overlay with planner info */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Party Planners in Germany</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {plannersWithCoords.length} planners shown on street map
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Locations Available</h3>
              <p>No planner locations to display on the map</p>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {plannersWithCoords.map((planner, index) => (
                <Card 
                  key={planner.id}
                  className={`bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    selectedPlanner === planner.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePlannerClick(planner.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-sm">{planner.business_name}</h4>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {planner.location_city}, {planner.location_state}
                          </span>
                          
                          {planner.average_rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {planner.average_rating}
                            </span>
                          )}
                          
                          {planner.base_price && (
                            <Badge variant="secondary" className="text-xs">
                              €{planner.base_price}+
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOnMap(planner);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="absolute bottom-1 right-1 z-10">
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          Click "View" to see detailed street view
        </div>
      </div>
    </div>
  );
};

export default MapView;