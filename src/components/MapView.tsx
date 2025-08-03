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

  // Create map URL centered on all planners
  const createMapUrl = () => {
    if (plannersWithCoords.length === 0) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=5.9559,47.2702,15.0419,55.0584&amp;layer=mapnik`;
    }

    // Calculate bounding box around all planners
    const lats = plannersWithCoords.map(p => p.latitude!);
    const lngs = plannersWithCoords.map(p => p.longitude!);
    const minLat = Math.min(...lats) - 0.1;
    const maxLat = Math.max(...lats) + 0.1;
    const minLng = Math.min(...lngs) - 0.1;
    const maxLng = Math.max(...lngs) + 0.1;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  };

  const mapUrl = createMapUrl();

  // Convert lat/lng to map position (approximate for overlay)
  const getMarkerPosition = (planner: any) => {
    if (plannersWithCoords.length === 0) return { left: '50%', top: '50%' };
    
    // Get bounds
    const lats = plannersWithCoords.map(p => p.latitude!);
    const lngs = plannersWithCoords.map(p => p.longitude!);
    const minLat = Math.min(...lats) - 0.1;
    const maxLat = Math.max(...lats) + 0.1;
    const minLng = Math.min(...lngs) - 0.1;
    const maxLng = Math.max(...lngs) + 0.1;
    
    // Calculate relative position (0-1) within the map bounds
    const latPercent = (planner.latitude! - minLat) / (maxLat - minLat);
    const lngPercent = (planner.longitude! - minLng) / (maxLng - minLng);
    
    // Convert to CSS position (inverted Y axis for latitude)
    return {
      left: `${lngPercent * 100}%`,
      top: `${(1 - latPercent) * 100}%`
    };
  };

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
      {/* Street Map with Custom Pin Overlays */}
      <div className="relative w-full h-full">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title="Street Map"
          loading="lazy"
        />
        
        {/* Custom pin overlays for each planner */}
        {plannersWithCoords.map((planner, index) => {
          const position = getMarkerPosition(planner);
          return (
            <div
              key={`pin-${planner.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-full z-20 cursor-pointer hover:scale-110 transition-transform"
              style={position}
              onClick={() => handlePlannerClick(planner.id)}
              title={`${planner.business_name} - ${planner.location_city}`}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white border-2 border-red-600 rounded-full text-red-600 text-xs flex items-center justify-center font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
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

      {/* Help text */}
      <div className="absolute bottom-1 right-1 z-10">
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          Click pins on map or "View" for details
        </div>
      </div>
    </div>
  );
};

export default MapView;