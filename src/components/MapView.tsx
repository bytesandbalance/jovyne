import React from 'react';
import { MapPin } from 'lucide-react';

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
  console.log('MapView rendering with planners:', planners);

  const plannersWithCoords = planners.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  console.log('Planners with coordinates:', plannersWithCoords);

  if (plannersWithCoords.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No planner locations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border bg-gradient-to-br from-blue-50 to-green-50">
      {/* Simple map representation */}
      <div className="w-full h-full relative flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-xl font-semibold mb-4">Party Planners Map</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Showing {plannersWithCoords.length} planners in Germany
          </p>
          
          <div className="grid gap-4">
            {plannersWithCoords.map((planner, index) => (
              <div
                key={planner.id}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white transition-colors shadow-sm"
                onClick={() => {
                  console.log('Planner clicked:', planner.id);
                  onPlannerSelect?.(planner.id);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-sm">{planner.business_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {planner.location_city}, {planner.location_state}
                    </p>
                    <p className="text-xs">
                      ⭐ {planner.average_rating ? planner.average_rating.toFixed(1) : 'N/A'} • 
                      €{planner.base_price || 'N/A'}+
                    </p>
                    <p className="text-xs text-gray-500">
                      📍 {planner.latitude?.toFixed(4)}, {planner.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;