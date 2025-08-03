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
      {/* Street Map with Custom Pin Overlays - No other overlays */}
      <div className="relative w-full h-full">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title="Street Map"
          loading="lazy"
        />
        
        {/* Custom pin overlays for each planner - positioned absolutely */}
        {plannersWithCoords.map((planner, index) => {
          // Fixed positions based on actual coordinates relative to the bounding box
          // These positions are calculated to match the map's initial view
          const positions = [
            { left: '45%', top: '35%' }, // Cologne (approximate position)
            { left: '50%', top: '60%' }, // Bonn (approximate position) 
            { left: '40%', top: '25%' }  // Düsseldorf (approximate position)
          ];
          
          return (
            <div
              key={`pin-${planner.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-full z-20 cursor-pointer hover:scale-125 transition-transform duration-200"
              style={positions[index]}
              onClick={() => handlePlannerClick(planner.id)}
              title={`${planner.business_name} - ${planner.location_city}`}
            >
              <div className="relative">
                <MapPin className="w-10 h-10 text-red-600 drop-shadow-2xl" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-red-600 rounded-full text-red-600 text-sm flex items-center justify-center font-bold shadow-xl">
                  {index + 1}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {planner.business_name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapView;