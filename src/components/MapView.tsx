import React from 'react';
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

// Create custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView: React.FC<MapViewProps> = ({ planners = [], onPlannerSelect }) => {
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
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={plannersWithCoords.length > 0 ? 6 : 4}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
      
      {plannersWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
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