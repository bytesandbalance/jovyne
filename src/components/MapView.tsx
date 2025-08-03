import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet's default icon issue - do this once globally
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

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
  const mapRef = useRef<L.Map | null>(null);
  
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

  // Handle map ready event
  const handleMapReady = () => {
    console.log('Map ready');
    
    // Force a resize after a short delay
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-gray-100" style={{ height: '400px' }}>
      <MapContainer
        center={center}
        zoom={plannersWithCoords.length > 0 ? 8 : 6}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {plannersWithCoords.map((planner) => {
          console.log('Rendering marker for planner:', planner.id, planner.latitude, planner.longitude);
          return (
            <Marker
              key={planner.id}
              position={[planner.latitude!, planner.longitude!]}
              eventHandlers={{
                click: () => {
                  console.log('Marker clicked:', planner.id);
                  onPlannerSelect?.(planner.id);
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <h3 className="font-bold text-sm mb-1">{planner.business_name}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {planner.location_city}, {planner.location_state}
                  </p>
                  <p className="text-xs mb-1">
                    Rating: {planner.average_rating ? `${planner.average_rating}/5` : 'N/A'}
                  </p>
                  <p className="text-xs">
                    From: €{planner.base_price || 'Contact for pricing'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {plannersWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No planner locations available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;