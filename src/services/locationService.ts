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
    suburb?: string;
    road?: string;
    houseNumber?: string;
  };
  boundingBox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

class LocationService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly SEARCH_DELAY = 300; // Debounce delay in ms
  private searchTimeout: NodeJS.Timeout | null = null;
  
  // Enhanced geocoding with multiple fallback strategies
  async geocodeAddress(address: string, limit: number = 8): Promise<LocationResult[]> {
    const results: LocationResult[] = [];
    
    try {
      // Try Nominatim first
      const nominatimResults = await this.geocodeWithNominatim(address, limit);
      results.push(...nominatimResults);
      
      // If no good results, try PIN code extraction
      if (results.length === 0) {
        const pinCodeResults = await this.geocodeByPinCode(address);
        results.push(...pinCodeResults);
      }
      
      // Sort by accuracy and relevance
      return this.sortAndFilterResults(results, address).slice(0, limit);
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
  
  // Debounced search for real-time suggestions
  async searchWithDebounce(address: string, callback: (results: LocationResult[]) => void): Promise<void> {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(async () => {
      if (address.length >= 3) {
        const results = await this.geocodeAddress(address);
        callback(results);
      } else {
        callback([]);
      }
    }, this.SEARCH_DELAY);
  }
  
  private async geocodeWithNominatim(address: string, limit: number = 8): Promise<LocationResult[]> {
    // Enhanced query construction for better Indian address matching
    let query = address.trim();
    
    // Add India if not already present
    if (!query.toLowerCase().includes('india')) {
      query += ', India';
    }
    
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodedQuery}&limit=${limit}&countrycodes=in&addressdetails=1&extratags=1&namedetails=1`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AquaHarvestApp/2.0 (Rainwater Harvesting Platform)'
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
        accuracy: this.calculateAccuracy(item, address),
        components: {
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country,
          pincode: item.address?.postcode,
          district: item.address?.state_district,
          suburb: item.address?.suburb || item.address?.neighbourhood,
          road: item.address?.road,
          houseNumber: item.address?.house_number
        },
        boundingBox: item.boundingbox ? {
          minLat: parseFloat(item.boundingbox[0]),
          maxLat: parseFloat(item.boundingbox[1]),
          minLng: parseFloat(item.boundingbox[2]),
          maxLng: parseFloat(item.boundingbox[3])
        } : undefined
      }));
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      return [];
    }
  }
  
  private sortAndFilterResults(results: LocationResult[], originalQuery: string): LocationResult[] {
    const queryLower = originalQuery.toLowerCase();
    
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevanceScore(result, queryLower)
      }))
      .sort((a, b) => {
        // Sort by accuracy first, then relevance
        const accuracyOrder = { high: 3, medium: 2, low: 1 };
        const accuracyDiff = accuracyOrder[b.accuracy] - accuracyOrder[a.accuracy];
        if (accuracyDiff !== 0) return accuracyDiff;
        
        return (b as any).relevanceScore - (a as any).relevanceScore;
      })
      .filter((result, index, array) => {
        // Remove duplicates based on coordinates
        return !array.slice(0, index).some(prev => 
          Math.abs(prev.coordinates.lat - result.coordinates.lat) < 0.001 &&
          Math.abs(prev.coordinates.lng - result.coordinates.lng) < 0.001
        );
      });
  }
  
  private calculateRelevanceScore(result: LocationResult, queryLower: string): number {
    let score = 0;
    const addressLower = result.address.toLowerCase();
    
    // Exact matches get highest score
    if (addressLower.includes(queryLower)) score += 10;
    
    // Component matches
    if (result.components.city?.toLowerCase().includes(queryLower)) score += 8;
    if (result.components.district?.toLowerCase().includes(queryLower)) score += 6;
    if (result.components.state?.toLowerCase().includes(queryLower)) score += 4;
    if (result.components.pincode?.includes(queryLower.replace(/\s/g, ''))) score += 9;
    
    // Prefer more specific locations
    if (result.components.road) score += 2;
    if (result.components.suburb) score += 1;
    
    return score;
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
        accuracy: 'high', // PIN codes are quite accurate
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
      const url = `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AquaHarvestApp/2.0 (Rainwater Harvesting Platform)'
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
          district: data.address?.state_district,
          suburb: data.address?.suburb || data.address?.neighbourhood,
          road: data.address?.road,
          houseNumber: data.address?.house_number
        }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
  
  private calculateAccuracy(nominatimResult: any, originalQuery: string): 'high' | 'medium' | 'low' {
    const importance = parseFloat(nominatimResult.importance || '0');
    const type = nominatimResult.type;
    const osm_type = nominatimResult.osm_type;
    
    // Check if query matches well with result
    const queryLower = originalQuery.toLowerCase();
    const displayNameLower = nominatimResult.display_name.toLowerCase();
    const hasGoodMatch = displayNameLower.includes(queryLower) || 
                        queryLower.split(' ').some(word => displayNameLower.includes(word));
    
    // High accuracy for specific locations
    if (importance > 0.6 || 
        ['house', 'building', 'address'].includes(type) ||
        osm_type === 'node' ||
        (hasGoodMatch && importance > 0.4)) {
      return 'high';
    }
    
    // Medium accuracy for areas and districts
    if (importance > 0.3 || 
        ['residential', 'commercial', 'suburb', 'neighbourhood'].includes(type) ||
        osm_type === 'way') {
      return 'medium';
    }
    
    return 'low';
  }
  
  // Enhanced PIN code database with more locations
  private getPinCodeData(pinCode: string): any {
    const pinCodeDatabase: Record<string, any> = {
      // Major cities
      '500001': { area: 'Hyderabad GPO', district: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.3850, lng: 78.4867 } },
      '400001': { area: 'Mumbai GPO', district: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
      '110001': { area: 'New Delhi GPO', district: 'New Delhi', state: 'Delhi', coordinates: { lat: 28.7041, lng: 77.1025 } },
      '560001': { area: 'Bangalore GPO', district: 'Bangalore', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
      '600001': { area: 'Chennai GPO', district: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
      '700001': { area: 'Kolkata GPO', district: 'Kolkata', state: 'West Bengal', coordinates: { lat: 22.5726, lng: 88.3639 } },
      '411001': { area: 'Pune GPO', district: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
      '380001': { area: 'Ahmedabad GPO', district: 'Ahmedabad', state: 'Gujarat', coordinates: { lat: 23.0225, lng: 72.5714 } },
      '302001': { area: 'Jaipur GPO', district: 'Jaipur', state: 'Rajasthan', coordinates: { lat: 26.9124, lng: 75.7873 } },
      '682001': { area: 'Kochi GPO', district: 'Ernakulam', state: 'Kerala', coordinates: { lat: 9.9312, lng: 76.2673 } },
      
      // Additional Andhra Pradesh PIN codes
      '530001': { area: 'Visakhapatnam GPO', district: 'Visakhapatnam', state: 'Andhra Pradesh', coordinates: { lat: 17.6868, lng: 83.2185 } },
      '533001': { area: 'Kakinada GPO', district: 'East Godavari', state: 'Andhra Pradesh', coordinates: { lat: 16.9891, lng: 82.2475 } },
      '522001': { area: 'Guntur GPO', district: 'Guntur', state: 'Andhra Pradesh', coordinates: { lat: 16.3067, lng: 80.4365 } },
      '524001': { area: 'Nellore GPO', district: 'Nellore', state: 'Andhra Pradesh', coordinates: { lat: 14.4426, lng: 79.9865 } },
      '515001': { area: 'Anantapur GPO', district: 'Anantapur', state: 'Andhra Pradesh', coordinates: { lat: 14.6819, lng: 77.6006 } },
      '517001': { area: 'Tirupati GPO', district: 'Chittoor', state: 'Andhra Pradesh', coordinates: { lat: 13.6288, lng: 79.4192 } },
      '518001': { area: 'Kurnool GPO', district: 'Kurnool', state: 'Andhra Pradesh', coordinates: { lat: 15.8281, lng: 78.0373 } },
      
      // Telangana PIN codes
      '500002': { area: 'Secunderabad', district: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.4399, lng: 78.4983 } },
      '506001': { area: 'Warangal GPO', district: 'Warangal', state: 'Telangana', coordinates: { lat: 17.9689, lng: 79.5941 } },
      '507001': { area: 'Khammam GPO', district: 'Khammam', state: 'Telangana', coordinates: { lat: 17.2473, lng: 80.1514 } }
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
  
  // Validate coordinates
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
  
  // Check if coordinates are within India
  isWithinIndia(lat: number, lng: number): boolean {
    return lat >= 6.0 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25;
  }
}

export const locationService = new LocationService();