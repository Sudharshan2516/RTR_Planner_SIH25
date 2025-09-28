import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GISMapProps {
  latitude?: number;
  longitude?: number;
  location?: string;
  roofArea?: number;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showRainfallData?: boolean;
  showSoilData?: boolean;
}

interface RainfallData {
  lat: number;
  lng: number;
  rainfall: number;
  color: string;
}

interface SoilData {
  lat: number;
  lng: number;
  soilType: string;
  permeability: string;
  color: string;
}

const GISMap: React.FC<GISMapProps> = ({
  latitude = 17.3850,
  longitude = 78.4867,
  location = "Hyderabad",
  roofArea = 0,
  onLocationSelect,
  showRainfallData = false,
  showSoilData = false
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude, longitude]);
  const [rainfallData, setRainfallData] = useState<RainfallData[]>([]);
  const [soilData, setSoilData] = useState<SoilData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Mock rainfall data for visualization
    if (showRainfallData) {
      const mockRainfallData: RainfallData[] = [
        { lat: 17.3850, lng: 78.4867, rainfall: 800, color: '#3B82F6' },
        { lat: 17.4000, lng: 78.5000, rainfall: 1200, color: '#1D4ED8' },
        { lat: 17.3700, lng: 78.4700, rainfall: 600, color: '#60A5FA' },
        { lat: 17.4100, lng: 78.4900, rainfall: 900, color: '#2563EB' },
        { lat: 17.3900, lng: 78.4800, rainfall: 1000, color: '#1E40AF' },
      ];
      setRainfallData(mockRainfallData);
    }

    // Mock soil data for visualization
    if (showSoilData) {
      const mockSoilData: SoilData[] = [
        { lat: 17.3850, lng: 78.4867, soilType: 'Clay', permeability: 'Low', color: '#DC2626' },
        { lat: 17.4000, lng: 78.5000, soilType: 'Sandy Loam', permeability: 'High', color: '#16A34A' },
        { lat: 17.3700, lng: 78.4700, soilType: 'Loam', permeability: 'Medium', color: '#D97706' },
        { lat: 17.4100, lng: 78.4900, soilType: 'Sandy Clay', permeability: 'Medium', color: '#CA8A04' },
        { lat: 17.3900, lng: 78.4800, soilType: 'Sand', permeability: 'High', color: '#059669' },
      ];
      setSoilData(mockSoilData);
    }
  }, [showRainfallData, showSoilData]);

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    
    if (onLocationSelect) {
      // Mock reverse geocoding
      const mockAddress = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      onLocationSelect(lat, lng, mockAddress);
    }
  };

  const customIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const waterDropIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Main location marker */}
        <Marker position={mapCenter} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">{location}</h3>
              <p className="text-sm text-gray-600">
                Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
              </p>
              {roofArea > 0 && (
                <p className="text-sm text-blue-600">
                  Roof Area: {roofArea} m²
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={waterDropIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">Selected Location</h3>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Rainfall data visualization */}
        {showRainfallData && rainfallData.map((data, index) => (
          <Circle
            key={`rainfall-${index}`}
            center={[data.lat, data.lng]}
            radius={data.rainfall * 2}
            pathOptions={{
              color: data.color,
              fillColor: data.color,
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold">Rainfall Data</h4>
                <p className="text-sm">Annual: {data.rainfall}mm</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Soil data visualization */}
        {showSoilData && soilData.map((data, index) => (
          <Circle
            key={`soil-${index}`}
            center={[data.lat, data.lng]}
            radius={500}
            pathOptions={{
              color: data.color,
              fillColor: data.color,
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold">Soil Data</h4>
                <p className="text-sm">Type: {data.soilType}</p>
                <p className="text-sm">Permeability: {data.permeability}</p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default GISMap;