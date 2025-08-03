import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

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
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
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

  useEffect(() => {
    // Dynamically import React-Leaflet to avoid SSR issues
    const loadMap = async () => {
      try {
        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
        const L = await import('leaflet');
        
        // Fix Leaflet's default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        setIsMapLoaded(true);
      } catch (error) {
        console.error('Failed to load map:', error);
      }
    };

    loadMap();
  }, []);

  if (!isMapLoaded) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden border bg-gray-100" style={{ height: '400px' }}>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Temporary fallback map display
  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-gray-100" style={{ height: '400px' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Map View</h3>
          <p className="text-muted-foreground mb-4">
            Showing {plannersWithCoords.length} planners in Germany
          </p>
          
          {plannersWithCoords.length === 0 ? (
            <p className="text-muted-foreground">No planner locations available</p>
          ) : (
            <div className="space-y-2">
              {plannersWithCoords.map((planner) => (
                <div 
                  key={planner.id}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-white/90 transition-colors"
                  onClick={() => {
                    console.log('Planner clicked:', planner.id);
                    onPlannerSelect?.(planner.id);
                  }}
                >
                  <h4 className="font-medium text-sm">{planner.business_name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {planner.location_city}, {planner.location_state}
                  </p>
                  <p className="text-xs">
                    {planner.latitude?.toFixed(4)}, {planner.longitude?.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;