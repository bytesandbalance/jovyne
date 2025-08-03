import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Create custom marker icon with absolute URLs
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView: React.FC<MapViewProps> = ({ planners = [], onPlannerSelect }) => {
  useEffect(() => {
    // Ensure Leaflet CSS is loaded
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }, []);

  // Filter planners that have coordinates
  const plannersWithCoords = planners.filter(
    planner => planner.latitude && planner.longitude
  );

  // Calculate center of map based on planners or default to US center
  const center: [number, number] = plannersWithCoords.length > 0
    ? [
        plannersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / plannersWithCoords.length,
        plannersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / plannersWithCoords.length
      ]
    : [39.8283, -98.5795]; // Center of US

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border bg-gray-100">
      <MapContainer
        center={center}
        zoom={plannersWithCoords.length > 0 ? 6 : 4}
        className="h-full w-full"
        zoomControl={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />
        
        {plannersWithCoords.map((planner) => (
          <Marker
            key={planner.id}
            position={[planner.latitude!, planner.longitude!]}
            icon={customIcon}
            eventHandlers={{
              click: () => onPlannerSelect?.(planner.id)
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
                  From: ${planner.base_price || 'Contact for pricing'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
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