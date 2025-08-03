import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [needsToken, setNeedsToken] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll show a message about needing Mapbox token
    // In a real app, this would come from environment variables or Supabase secrets
    const token = 'pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xrMGh6NGh1MDRmNDNkcWk5ZTh6aW5ndiJ9.example'; // Demo token placeholder
    
    if (!token || token.includes('example')) {
      setNeedsToken(true);
      return;
    }

    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;
    setNeedsToken(false);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for planners with coordinates
    planners.forEach((planner) => {
      if (planner.latitude && planner.longitude) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${planner.business_name}</h3>
            <p class="text-xs text-gray-600">${planner.location_city}, ${planner.location_state}</p>
            <p class="text-xs">Rating: ${planner.average_rating || 'N/A'}</p>
            <p class="text-xs">From: $${planner.base_price || 'Contact for pricing'}</p>
          </div>
        `);

        const marker = new mapboxgl.Marker({
          color: '#8B5CF6', // Primary color
        })
          .setLngLat([planner.longitude, planner.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          onPlannerSelect?.(planner.id);
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [planners, onPlannerSelect, mapboxToken]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setNeedsToken(false);
      // Reinitialize map with the provided token
      window.location.reload();
    }
  };

  if (needsToken) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
          <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mapbox Integration Required</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            To display the interactive map with planner locations, please provide your Mapbox access token.
            You can get one free at mapbox.com
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              placeholder="Enter your Mapbox access token..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              type="password"
            />
            <Button onClick={handleTokenSubmit}>
              <Navigation className="w-4 h-4 mr-2" />
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
    </div>
  );
};

export default MapView;