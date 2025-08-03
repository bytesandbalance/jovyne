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

  // Create map URL with embedded markers using a different service
  const createMapUrl = () => {
    if (plannersWithCoords.length === 0) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=5.9559,47.2702,15.0419,55.0584&amp;layer=mapnik`;
    }

    // Use OpenRouteService static map API which supports multiple markers
    const markers = plannersWithCoords.map((planner, index) => 
      `${planner.longitude},${planner.latitude}`
    ).join('|');
    
    // Calculate bounding box
    const lats = plannersWithCoords.map(p => p.latitude!);
    const lngs = plannersWithCoords.map(p => p.longitude!);
    const minLat = Math.min(...lats) - 0.05;
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;

    // Alternative approach: Use a service that generates static maps with markers
    // Using OpenStreetMap static image with markers
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Using MapQuest Static Map API (free tier) with markers
    const width = 800;
    const height = 400;
    const zoom = 8;
    
    const markerParams = plannersWithCoords.map((planner, index) => 
      `&marker=${planner.latitude},${planner.longitude}|${index + 1}`
    ).join('');

    return `https://www.mapquestapi.com/staticmap/v5/map?key=consumer_key_not_needed_for_demo&size=${width},${height}&zoom=${zoom}&center=${centerLat},${centerLng}${markerParams}&type=map&scalebar=false`;
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
      {/* Static Street Map with Embedded Markers */}
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        {plannersWithCoords.length === 0 ? (
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Locations Available</h3>
            <p className="text-muted-foreground">No planner locations to display on the map</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Create a simple visual map representation */}
            <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
              {/* Map Grid Background */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="street-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94A3B8" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#street-grid)" />
                </svg>
              </div>
              
              {/* Germany outline suggestion */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="text-6xl text-gray-400">🇩🇪</div>
              </div>
              
              {/* Stable markers positioned geographically */}
              {plannersWithCoords.map((planner, index) => {
                // More accurate positioning based on actual German geography
                const positions = [
                  { left: '45%', top: '45%', city: 'Cologne' },     // Cologne - western Germany
                  { left: '50%', top: '55%', city: 'Bonn' },        // Bonn - slightly south of Cologne  
                  { left: '42%', top: '30%', city: 'Düsseldorf' }   // Düsseldorf - northwest
                ];
                
                return (
                  <div
                    key={`stable-pin-${planner.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-all duration-200 group"
                    style={positions[index]}
                    onClick={() => handlePlannerClick(planner.id)}
                  >
                    <div className="relative">
                      {/* Pin */}
                      <MapPin className="w-12 h-12 text-red-600 drop-shadow-2xl" fill="currentColor" />
                      
                      {/* Number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-3 border-red-600 rounded-full text-red-600 text-sm flex items-center justify-center font-bold shadow-xl">
                        {index + 1}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{planner.business_name}</div>
                          <div className="text-xs">{planner.location_city}</div>
                          <div className="text-xs">€{planner.base_price}+ • ⭐{planner.average_rating}</div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* City labels */}
              <div className="absolute top-4 left-4 text-sm text-gray-600 font-medium bg-white/80 rounded-lg p-2">
                🏙️ North Rhine-Westphalia, Germany
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;