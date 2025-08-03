import React, { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface Planner {
  id: string;
  business_name: string;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  average_rating?: number;
  base_price?: number;
}

interface MapViewProps {
  planners?: Planner[];
  onPlannerSelect?: (plannerId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ planners = [], onPlannerSelect }) => {
  const [selectedPlanner, setSelectedPlanner] = useState<string | null>(null);

  const plannersWithCoords = planners.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  const center: [number, number] =
    plannersWithCoords.length > 0
      ? [
          plannersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) /
            plannersWithCoords.length,
          plannersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) /
            plannersWithCoords.length,
        ]
      : [51.1657, 10.4515]; // Default to Germany center

  // Create static map URL with embedded markers using OpenStreetMap static API
  const createStaticMapUrl = () => {
    if (plannersWithCoords.length === 0) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=5.9559,47.2702,15.0419,55.0584&layer=mapnik`;
    }

    // Calculate bounds
    const lats = plannersWithCoords.map(p => p.latitude!);
    const lngs = plannersWithCoords.map(p => p.longitude!);
    const minLat = Math.min(...lats) - 0.05;
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;

    // Use a service that creates static map images with markers
    const width = 800;
    const height = 400;
    const centerLat = center[0];
    const centerLng = center[1];
    const zoom = 8;

    // Using StaticMapMaker API (free service)
    const markers = plannersWithCoords.map((planner, index) => 
      `${planner.latitude},${planner.longitude},red,${index + 1}`
    ).join('|');

    // Alternative: Use OpenStreetMap export with single marker in center, then overlay pins
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  };

  const handlePlannerClick = (plannerId: string) => {
    setSelectedPlanner(plannerId);
    onPlannerSelect?.(plannerId);
  };

  const openInFullMap = (planner: Planner) => {
    const url = `https://www.openstreetmap.org/?mlat=${planner.latitude}&mlon=${planner.longitude}&zoom=15`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border bg-gray-100">
      {plannersWithCoords.length === 0 ? (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No planner locations available</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Embed OpenStreetMap */}
          <iframe
            src={createStaticMapUrl()}
            className="w-full h-full border-0"
            title="Party Planners Map"
            loading="lazy"
          />

          {/* Overlay markers with precise positioning */}
          {plannersWithCoords.map((planner, index) => {
            // Calculate relative positions based on the bounds
            const lats = plannersWithCoords.map(p => p.latitude!);
            const lngs = plannersWithCoords.map(p => p.longitude!);
            const minLat = Math.min(...lats) - 0.05;
            const maxLat = Math.max(...lats) + 0.05;
            const minLng = Math.min(...lngs) - 0.05;
            const maxLng = Math.max(...lngs) + 0.05;

            const latPercent = (planner.latitude! - minLat) / (maxLat - minLat);
            const lngPercent = (planner.longitude! - minLng) / (maxLng - minLng);

            return (
              <div
                key={`marker-${planner.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-125 transition-all duration-200 group z-20"
                style={{
                  left: `${lngPercent * 100}%`,
                  top: `${(1 - latPercent) * 100}%`,
                }}
                onClick={() => handlePlannerClick(planner.id)}
              >
                <div className="relative">
                  <MapPin 
                    className={`w-8 h-8 drop-shadow-2xl ${
                      selectedPlanner === planner.id ? 'text-blue-600' : 'text-red-600'
                    }`} 
                    fill="currentColor" 
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white border-2 border-current rounded-full text-current text-xs flex items-center justify-center font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                    <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl min-w-max">
                      <div className="font-semibold">{planner.business_name}</div>
                      <div className="text-xs">{planner.location_city}, {planner.location_state}</div>
                      <div className="text-xs">
                        ⭐ {planner.average_rating ? planner.average_rating.toFixed(1) : 'N/A'} • 
                        €{planner.base_price || 'N/A'}+
                      </div>
                      <button
                        className="text-xs text-blue-300 hover:text-blue-100 mt-1 flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInFullMap(planner);
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in map
                      </button>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Info overlay */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-600 shadow-lg">
            {plannersWithCoords.length} planners • Click pins for details
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;