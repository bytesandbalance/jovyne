import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper to force map refresh (in case of resize issues)
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ planners = [], onPlannerSelect }) => {
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

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border bg-gray-100">
      <MapContainer
        center={center}
        zoom={plannersWithCoords.length > 0 ? 6 : 4}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <ResizeMap />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {plannersWithCoords.map((planner) => (
          <Marker
            key={planner.id}
            position={[planner.latitude!, planner.longitude!]}
            eventHandlers={
              onPlannerSelect
                ? {
                    click: () => onPlannerSelect(planner.id),
                  }
                : undefined
            }
          >
            <Popup>
              <div className="min-w-48 text-sm">
                <h3 className="font-semibold">{planner.business_name}</h3>
                <p className="text-gray-600 text-xs mb-1">
                  {planner.location_city}, {planner.location_state}
                </p>
                <p className="text-xs">
                  ⭐ {planner.average_rating ? planner.average_rating.toFixed(1) : 'N/A'} •
                  €{planner.base_price || 'N/A'}+
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {plannersWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No planner locations available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;