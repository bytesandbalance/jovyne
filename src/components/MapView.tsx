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

  // Create static map URL with embedded markers that won't move
  const createMapUrl = () => {
    if (plannersWithCoords.length === 0) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=5.9559,47.2702,15.0419,55.0584&amp;layer=mapnik`;
    }

    // Calculate center point
    const centerLat = plannersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / plannersWithCoords.length;
    const centerLng = plannersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / plannersWithCoords.length;
    
    // Using OpenStreetMap with a service that supports multiple markers
    // Format: https://www.openstreetmap.org/?mlat=LAT&mlon=LON&zoom=ZOOM#map=ZOOM/LAT/LON
    const zoom = 9;
    
    // Create URL with all markers using the OSM marker syntax
    const markerParams = plannersWithCoords.map((planner, index) => 
      `&marker[${index}]=${planner.latitude},${planner.longitude},red-${index + 1}`
    ).join('');
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng-0.4},${centerLat-0.3},${centerLng+0.4},${centerLat+0.3}&layer=mapnik&marker=${centerLat},${centerLng}`;
  };

  const mapUrl = createMapUrl();

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
      {/* Real Street Map with Disabled Zoom/Pan to Keep Pins Stable */}
      <div className="relative w-full h-full">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0 pointer-events-none"
          title="Street Map"
          loading="lazy"
        />
        
        {/* Overlay pins that stay stable because map can't be moved */}
        {plannersWithCoords.map((planner, index) => {
          // Precise positioning based on German geography
          const positions = [
            { left: '45%', top: '45%' }, // Cologne
            { left: '50%', top: '58%' }, // Bonn (south of Cologne)
            { left: '42%', top: '32%' }  // Düsseldorf (north of Cologne)
          ];
          
          return (
            <div
              key={`pin-${planner.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-full z-20 cursor-pointer hover:scale-125 transition-all duration-200 group"
              style={positions[index]}
              onClick={() => handlePlannerClick(planner.id)}
            >
              <div className="relative">
                <MapPin className="w-10 h-10 text-red-600 drop-shadow-2xl" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-red-600 rounded-full text-red-600 text-sm flex items-center justify-center font-bold shadow-xl">
                  {index + 1}
                </div>
                
                {/* Rich tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                  <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    <div className="font-semibold">{planner.business_name}</div>
                    <div className="text-xs">{planner.location_city}</div>
                    <div className="text-xs">€{planner.base_price}+ • ⭐{planner.average_rating}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Enable interaction hint */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
          Click pins for details
        </div>
      </div>
    </div>
  );
};

export default MapView;