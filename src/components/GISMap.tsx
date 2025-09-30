// src/components/GISMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Fix for default Leaflet markers (so icons load correctly with Vite)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// -------------------- Types --------------------
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
  region: string;
}

interface SoilData {
  lat: number;
  lng: number;
  soilType: string;
  permeability: string;
  color: string;
  region: string;
}

// -------------------- Component --------------------
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
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // -------------------- Global Data Generation --------------------
  useEffect(() => {
    if (showRainfallData) {
      setRainfallData(generateGlobalRainfallData(mapCenter));
    }

    if (showSoilData) {
      setSoilData(generateGlobalSoilData(mapCenter));
    }
  }, [showRainfallData, showSoilData, mapCenter]);

  // Generate rainfall data based on geographic location
  const generateGlobalRainfallData = (center: [number, number]): RainfallData[] => {
    const [centerLat, centerLng] = center;
    const data: RainfallData[] = [];
    
    // Generate data points in a grid around the center
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const lat = centerLat + (i * 0.1);
        const lng = centerLng + (j * 0.1);
        
        // Estimate rainfall based on geographic location
        let rainfall = estimateRainfallByLocation(lat, lng);
        
        // Add some variation
        rainfall += (Math.random() - 0.5) * 200;
        rainfall = Math.max(200, Math.min(3000, rainfall));
        
        const color = getRainfallColor(rainfall);
        const region = getRegionName(lat, lng);
        
        data.push({ lat, lng, rainfall: Math.round(rainfall), color, region });
      }
    }
    
    return data;
  };

  // Generate soil data based on geographic location
  const generateGlobalSoilData = (center: [number, number]): SoilData[] => {
    const [centerLat, centerLng] = center;
    const data: SoilData[] = [];
    
    // Generate data points in a grid around the center
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const lat = centerLat + (i * 0.15);
        const lng = centerLng + (j * 0.15);
        
        const soilInfo = estimateSoilByLocation(lat, lng);
        const region = getRegionName(lat, lng);
        
        data.push({ 
          lat, 
          lng, 
          soilType: soilInfo.type, 
          permeability: soilInfo.permeability, 
          color: soilInfo.color,
          region 
        });
      }
    }
    
    return data;
  };

  // Estimate rainfall based on geographic location in India
  const estimateRainfallByLocation = (lat: number, lng: number): number => {
    // Western Ghats and coastal areas - high rainfall
    if ((lat >= 8 && lat <= 21 && lng >= 72 && lng <= 77) || // Western coast
        (lat >= 8 && lat <= 12 && lng >= 75 && lng <= 77)) { // Kerala
      return 2000 + Math.random() * 1000;
    }
    
    // Northeast India - very high rainfall
    if (lat >= 24 && lat <= 29 && lng >= 88 && lng <= 97) {
      return 2500 + Math.random() * 1500;
    }
    
    // Eastern coast - moderate to high rainfall
    if (lat >= 11 && lat <= 22 && lng >= 79 && lng <= 87) {
      return 1000 + Math.random() * 800;
    }
    
    // Central India - moderate rainfall
    if (lat >= 15 && lat <= 25 && lng >= 75 && lng <= 85) {
      return 800 + Math.random() * 600;
    }
    
    // Rajasthan and western dry areas - low rainfall
    if (lat >= 24 && lat <= 30 && lng >= 68 && lng <= 78) {
      return 300 + Math.random() * 400;
    }
    
    // Deccan plateau - moderate rainfall
    if (lat >= 12 && lat <= 20 && lng >= 74 && lng <= 80) {
      return 600 + Math.random() * 500;
    }
    
    // Default for other areas
    return 800 + Math.random() * 400;
  };

  // Estimate soil type based on geographic location
  const estimateSoilByLocation = (lat: number, lng: number) => {
    // Alluvial soils - Gangetic plains and deltas
    if ((lat >= 24 && lat <= 30 && lng >= 75 && lng <= 88) || // Gangetic plains
        (lat >= 15 && lat <= 17 && lng >= 80 && lng <= 82)) { // Godavari delta
      return {
        type: Math.random() > 0.5 ? 'Alluvial' : 'Sandy Loam',
        permeability: 'High',
        color: '#16A34A'
      };
    }
    
    // Black cotton soil - Deccan plateau
    if (lat >= 15 && lat <= 22 && lng >= 74 && lng <= 80) {
      return {
        type: 'Black Cotton',
        permeability: 'Low',
        color: '#1F2937'
      };
    }
    
    // Red soil - South India
    if (lat >= 8 && lat <= 18 && lng >= 75 && lng <= 80) {
      return {
        type: 'Red Soil',
        permeability: 'Medium',
        color: '#DC2626'
      };
    }
    
    // Laterite soil - Western Ghats
    if (lat >= 8 && lat <= 21 && lng >= 72 && lng <= 77) {
      return {
        type: 'Laterite',
        permeability: 'Medium',
        color: '#D97706'
      };
    }
    
    // Desert soil - Rajasthan
    if (lat >= 24 && lat <= 30 && lng >= 68 && lng <= 78) {
      return {
        type: 'Sandy',
        permeability: 'High',
        color: '#F59E0B'
      };
    }
    
    // Mountain soil - Himalayas and hills
    if (lat >= 28 && lat <= 35) {
      return {
        type: 'Mountain Soil',
        permeability: 'Medium',
        color: '#6B7280'
      };
    }
    
    // Default - mixed soil
    return {
      type: Math.random() > 0.5 ? 'Loam' : 'Clay Loam',
      permeability: 'Medium',
      color: '#CA8A04'
    };
  };

  // Get color based on rainfall amount
  const getRainfallColor = (rainfall: number): string => {
    if (rainfall >= 2000) return '#1E40AF'; // Dark blue - very high
    if (rainfall >= 1500) return '#2563EB'; // Blue - high
    if (rainfall >= 1000) return '#3B82F6'; // Medium blue - moderate high
    if (rainfall >= 600) return '#60A5FA';  // Light blue - moderate
    if (rainfall >= 300) return '#93C5FD';  // Very light blue - low
    return '#DBEAFE'; // Pale blue - very low
  };

  // Get region name based on coordinates
  const getRegionName = (lat: number, lng: number): string => {
    if (lat >= 28 && lat <= 35) return 'Northern India';
    if (lat >= 24 && lat <= 28 && lng >= 68 && lng <= 78) return 'Rajasthan';
    if (lat >= 24 && lat <= 30 && lng >= 75 && lng <= 88) return 'Gangetic Plains';
    if (lat >= 22 && lat <= 28 && lng >= 88 && lng <= 97) return 'Northeast India';
    if (lat >= 15 && lat <= 25 && lng >= 75 && lng <= 85) return 'Central India';
    if (lat >= 15 && lat <= 22 && lng >= 74 && lng <= 80) return 'Deccan Plateau';
    if (lat >= 8 && lat <= 18 && lng >= 75 && lng <= 80) return 'South India';
    if (lat >= 8 && lat <= 21 && lng >= 72 && lng <= 77) return 'Western Ghats';
    if (lat >= 11 && lat <= 22 && lng >= 79 && lng <= 87) return 'Eastern Coast';
    return 'India';
  };

  // -------------------- Map Click Handler --------------------
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    
    // Update map center to clicked location
    setMapCenter([lat, lng]);

    if (onLocationSelect) {
      try {
        // Try to get address from reverse geocoding (mock implementation)
        const address = await reverseGeocode(lat, lng);
        onLocationSelect(lat, lng, address);
      } catch (error) {
        const mockAddress = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationSelect(lat, lng, mockAddress);
      }
    }
  };
  
  // Mock reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // In a real app, you'd use a geocoding service like Nominatim or Google Maps
    // For demo purposes, we'll return a mock address based on coordinates
    const cities = [
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 }
    ];
    
    // Find closest city
    let closestCity = cities[0];
    let minDistance = Math.sqrt(Math.pow(lat - cities[0].lat, 2) + Math.pow(lng - cities[0].lng, 2));
    
    for (const city of cities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }
    
    return `${closestCity.name}, India`;
  };

  // -------------------- Custom Icons --------------------
  const customIcon = new Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const waterDropIcon = new Icon({
    iconUrl:
      'data:image/svg+xml;base64,' +
      btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
        </svg>
      `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  // -------------------- Render --------------------
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          // Fix: allow click events
          map.on('click', handleMapClick);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                <p className="text-sm text-blue-600">Roof Area: {roofArea} m²</p>
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

        {/* Rainfall visualization */}
        {showRainfallData &&
          rainfallData.map((data, index) => (
            <Circle
              key={`rainfall-${index}`}
              center={[data.lat, data.lng]}
              radius={data.rainfall * 2}
              pathOptions={{
                color: data.color,
                fillColor: data.color,
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold">Rainfall Data - {data.region}</h4>
                  <p className="text-sm">Annual Rainfall: {data.rainfall} mm</p>
                  <p className="text-xs text-gray-600">Lat: {data.lat.toFixed(3)}, Lng: {data.lng.toFixed(3)}</p>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Soil visualization */}
        {showSoilData &&
          soilData.map((data, index) => (
            <Circle
              key={`soil-${index}`}
              center={[data.lat, data.lng]}
              radius={500}
              pathOptions={{
                color: data.color,
                fillColor: data.color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold">Soil Data - {data.region}</h4>
                  <p className="text-sm">Type: {data.soilType}</p>
                  <p className="text-sm">Permeability: {data.permeability}</p>
                  <p className="text-xs text-gray-600">Lat: {data.lat.toFixed(3)}, Lng: {data.lng.toFixed(3)}</p>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  );
};

export default GISMap;
