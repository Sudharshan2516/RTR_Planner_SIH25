// Enhanced Location Service for accurate geocoding and reverse geocoding

export interface LocationResult {
  address: string;
  coordinates: { lat: number; lng: number };
  accuracy: 'high' | 'medium' | 'low';
  components: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    district?: string;
  };
}

class LocationService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  
  // Enhanced geocoding with multiple fallback strategies
  async geocodeAddress(address: string): Promise<LocationResult[]> {
    const results: LocationResult[] = [];
    
    try {
      // Try Nominatim first
      const nominatimResults = await this.geocodeWithNominatim(address);
      results.push(...nominatimResults);
      
      // If no good results, try PIN code extraction
      if (results.length === 0) {
        const pinCodeResults = await this.geocodeByPinCode(address);
        results.push(...pinCodeResults);
      }
      
      return results.slice(0, 5); // Return top 5 results
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
  
  private async geocodeWithNominatim(address: string): Promise<LocationResult[]> {
    const query = encodeURIComponent(address + ', India');
    const url = `${this.NOMINATIM_BASE_URL}/search?format=json&q=${query}&limit=5&countrycodes=in&addressdetails=1`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RainwaterHarvestingApp/1.0'
        }
      });
      
      if (!response.ok) throw new Error('Nominatim API error');
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        address: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
        accuracy: this.calculateAccuracy(item),
        components: {
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country,
          pincode: item.address?.postcode,
          district: item.address?.state_district
        }
      }));
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      return [];
    }
  }
  
  private async geocodeByPinCode(address: string): Promise<LocationResult[]> {
    // Extract PIN code from address
    const pinCodeMatch = address.match(/\b\d{6}\b/);
    if (!pinCodeMatch) return [];
    
    const pinCode = pinCodeMatch[0];
    
    // Use PIN code database (simplified version)
    const pinCodeData = this.getPinCodeData(pinCode);
    if (pinCodeData) {
      return [{
        address: `${pinCodeData.area}, ${pinCodeData.district}, ${pinCodeData.state}, India - ${pinCode}`,
        coordinates: pinCodeData.coordinates,
        accuracy: 'medium',
        components: {
          city: pinCodeData.area,
          state: pinCodeData.state,
          district: pinCodeData.district,
          pincode: pinCode,
          country: 'India'
        }
      }];
    }
    
    return [];
  }
  
  // Reverse geocoding - get address from coordinates
  async reverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
    try {
      const url = `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RainwaterHarvestingApp/1.0'
        }
      });
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      return {
        address: data.display_name,
        coordinates: { lat, lng },
        accuracy: 'high',
        components: {
          city: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country,
          pincode: data.address?.postcode,
          district: data.address?.state_district
        }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
  
  private calculateAccuracy(nominatimResult: any): 'high' | 'medium' | 'low' {
    const importance = parseFloat(nominatimResult.importance || '0');
    const type = nominatimResult.type;
    
    if (importance > 0.6 || ['house', 'building'].includes(type)) return 'high';
    if (importance > 0.4 || ['residential', 'commercial'].includes(type)) return 'medium';
    return 'low';
  }
  
  // Simplified PIN code database (in production, use a comprehensive database)
  private getPinCodeData(pinCode: string): any {
    const pinCodeDatabase: Record<string, any> = {
      '500001': { area: 'Hyderabad GPO', district: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.3850, lng: 78.4867 } },
      '400001': { area: 'Mumbai GPO', district: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
      '110001': { area: 'New Delhi GPO', district: 'New Delhi', state: 'Delhi', coordinates: { lat: 28.7041, lng: 77.1025 } },
      '560001': { area: 'Bangalore GPO', district: 'Bangalore', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
      '600001': { area: 'Chennai GPO', district: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
      '700001': { area: 'Kolkata GPO', district: 'Kolkata', state: 'West Bengal', coordinates: { lat: 22.5726, lng: 88.3639 } },
      '411001': { area: 'Pune GPO', district: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
      '380001': { area: 'Ahmedabad GPO', district: 'Ahmedabad', state: 'Gujarat', coordinates: { lat: 23.0225, lng: 72.5714 } },
      '302001': { area: 'Jaipur GPO', district: 'Jaipur', state: 'Rajasthan', coordinates: { lat: 26.9124, lng: 75.7873 } },
      '682001': { area: 'Kochi GPO', district: 'Ernakulam', state: 'Kerala', coordinates: { lat: 9.9312, lng: 76.2673 } }
    };
    
    return pinCodeDatabase[pinCode] || null;
  }
  
  // Get current location with high accuracy
  async getCurrentLocation(): Promise<LocationResult | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await this.reverseGeocode(latitude, longitude);
          resolve(result);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
}

export const locationService = new LocationService();