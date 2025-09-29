// Rainfall Data API Integration Service

export interface RainfallData {
  location: string;
  coordinates: { lat: number; lng: number };
  annualRainfall: number;
  monthlyData: MonthlyRainfall[];
  reliability: number;
  lastUpdated: string;
  source: string;
}

export interface MonthlyRainfall {
  month: string;
  rainfall: number;
  rainyDays: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface GroundwaterData {
  location: string;
  coordinates: { lat: number; lng: number };
  depth: number;
  quality: string;
  aquiferType: string;
  seasonalVariation: {
    preMonsoon: number;
    monsoon: number;
    postMonsoon: number;
  };
  rechargeRate: number;
  lastUpdated: string;
}

class RainfallApiService {
  private readonly OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo-key';
  private readonly IMD_API_BASE = 'https://api.data.gov.in/resource/';
  
  // Fallback rainfall data for major Indian cities
  private fallbackRainfallData: Record<string, RainfallData> = {
    'mumbai': {
      location: 'Mumbai, Maharashtra',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      annualRainfall: 2200,
      monthlyData: this.generateMumbaiRainfall(),
      reliability: 0.92,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'delhi': {
      location: 'Delhi, India',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      annualRainfall: 600,
      monthlyData: this.generateDelhiRainfall(),
      reliability: 0.78,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'bangalore': {
      location: 'Bangalore, Karnataka',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      annualRainfall: 900,
      monthlyData: this.generateBangaloreRainfall(),
      reliability: 0.85,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'hyderabad': {
      location: 'Hyderabad, Telangana',
      coordinates: { lat: 17.3850, lng: 78.4867 },
      annualRainfall: 800,
      monthlyData: this.generateHyderabadRainfall(),
      reliability: 0.82,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'chennai': {
      location: 'Chennai, Tamil Nadu',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      annualRainfall: 1200,
      monthlyData: this.generateChennaiRainfall(),
      reliability: 0.88,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'kolkata': {
      location: 'Kolkata, West Bengal',
      coordinates: { lat: 22.5726, lng: 88.3639 },
      annualRainfall: 1600,
      monthlyData: this.generateKolkataRainfall(),
      reliability: 0.90,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'pune': {
      location: 'Pune, Maharashtra',
      coordinates: { lat: 18.5204, lng: 73.8567 },
      annualRainfall: 700,
      monthlyData: this.generatePuneRainfall(),
      reliability: 0.86,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'ahmedabad': {
      location: 'Ahmedabad, Gujarat',
      coordinates: { lat: 23.0225, lng: 72.5714 },
      annualRainfall: 800,
      monthlyData: this.generateAhmedabadRainfall(),
      reliability: 0.75,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'jaipur': {
      location: 'Jaipur, Rajasthan',
      coordinates: { lat: 25.2048, lng: 75.8412 },
      annualRainfall: 550,
      monthlyData: this.generateJaipurRainfall(),
      reliability: 0.70,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    },
    'kochi': {
      location: 'Kochi, Kerala',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      annualRainfall: 3000,
      monthlyData: this.generateKochiRainfall(),
      reliability: 0.95,
      lastUpdated: new Date().toISOString(),
      source: 'IMD Historical Data'
    }
  };

  async getRainfallData(location: string, coordinates?: { lat: number; lng: number }): Promise<RainfallData> {
    try {
      // First try to get data from API
      if (coordinates) {
        const apiData = await this.fetchFromOpenWeather(coordinates);
        if (apiData) return apiData;
      }
      
      // Fallback to local data
      return this.getFallbackRainfallData(location, coordinates);
    } catch (error) {
      console.error('Error fetching rainfall data:', error);
      return this.getFallbackRainfallData(location, coordinates);
    }
  }

  async getGroundwaterData(location: string, coordinates: { lat: number; lng: number }): Promise<GroundwaterData> {
    try {
      // For now, return simulated groundwater data
      // In production, this would integrate with CGWB or state groundwater APIs
      return this.generateGroundwaterData(location, coordinates);
    } catch (error) {
      console.error('Error fetching groundwater data:', error);
      // Return default groundwater data
      return {
        location,
        coordinates,
        depth: 15,
        quality: 'Good (TDS 300-600 mg/L)',
        aquiferType: 'Unconfined Aquifer',
        seasonalVariation: {
          preMonsoon: 17,
          monsoon: 13,
          postMonsoon: 15
        },
        rechargeRate: 12,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  private async fetchFromOpenWeather(coordinates: { lat: number; lng: number }): Promise<RainfallData | null> {
    try {
      // Note: OpenWeather doesn't provide historical rainfall data in free tier
      // This is a placeholder for when you have access to rainfall APIs
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${this.OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      // Transform OpenWeather data to our format
      return {
        location: `${data.name}, ${data.sys.country}`,
        coordinates,
        annualRainfall: this.estimateAnnualRainfall(coordinates),
        monthlyData: this.generateMonthlyRainfall(coordinates),
        reliability: 0.80,
        lastUpdated: new Date().toISOString(),
        source: 'OpenWeather API'
      };
    } catch (error) {
      console.error('OpenWeather API error:', error);
      return null;
    }
  }

  private getFallbackRainfallData(location: string, coordinates?: { lat: number; lng: number }): RainfallData {
    // Try to match location with known cities
    const cityKey = this.findCityKey(location);
    
    if (cityKey && this.fallbackRainfallData[cityKey]) {
      return this.fallbackRainfallData[cityKey];
    }
    
    // Generate data based on coordinates if available
    if (coordinates) {
      return this.generateRainfallFromCoordinates(location, coordinates);
    }
    
    // Default fallback
    return {
      location,
      coordinates: coordinates || { lat: 20.5937, lng: 78.9629 }, // Center of India
      annualRainfall: 800,
      monthlyData: this.generateDefaultMonthlyRainfall(),
      reliability: 0.60,
      lastUpdated: new Date().toISOString(),
      source: 'Estimated Data'
    };
  }

  private findCityKey(location: string): string | null {
    const locationLower = location.toLowerCase();
    
    for (const cityKey of Object.keys(this.fallbackRainfallData)) {
      if (locationLower.includes(cityKey) || 
          this.fallbackRainfallData[cityKey].location.toLowerCase().includes(locationLower)) {
        return cityKey;
      }
    }
    
    return null;
  }

  private generateRainfallFromCoordinates(location: string, coordinates: { lat: number; lng: number }): RainfallData {
    const annualRainfall = this.estimateAnnualRainfall(coordinates);
    
    return {
      location,
      coordinates,
      annualRainfall,
      monthlyData: this.generateMonthlyRainfall(coordinates),
      reliability: 0.75,
      lastUpdated: new Date().toISOString(),
      source: 'Geographic Estimation'
    };
  }

  private estimateAnnualRainfall(coordinates: { lat: number; lng: number }): number {
    const { lat, lng } = coordinates;
    
    // Simple estimation based on geographic patterns in India
    if (lat >= 8 && lat <= 12 && lng >= 75 && lng <= 77) return 3000; // Kerala
    if (lat >= 18 && lat <= 20 && lng >= 72 && lng <= 74) return 2200; // Mumbai region
    if (lat >= 22 && lat <= 24 && lng >= 88 && lng <= 90) return 1600; // Kolkata region
    if (lat >= 12 && lat <= 14 && lng >= 80 && lng <= 82) return 1200; // Chennai region
    if (lat >= 12 && lat <= 14 && lng >= 77 && lng <= 78) return 900;  // Bangalore region
    if (lat >= 17 && lat <= 19 && lng >= 78 && lng <= 80) return 800;  // Hyderabad region
    if (lat >= 28 && lat <= 30 && lng >= 76 && lng <= 78) return 600;  // Delhi region
    if (lat >= 24 && lat <= 27 && lng >= 74 && lng <= 76) return 550;  // Rajasthan
    
    // Default for other regions
    return 800;
  }

  private generateMonthlyRainfall(coordinates: { lat: number; lng: number }): MonthlyRainfall[] {
    const annualRainfall = this.estimateAnnualRainfall(coordinates);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Different patterns based on location
    const { lat } = coordinates;
    
    if (lat <= 15) {
      // South India - dual monsoon pattern
      return this.generateSouthIndiaPattern(months, annualRainfall);
    } else {
      // North India - single monsoon pattern
      return this.generateNorthIndiaPattern(months, annualRainfall);
    }
  }

  private generateSouthIndiaPattern(months: string[], annual: number): MonthlyRainfall[] {
    const distribution = [0.05, 0.03, 0.04, 0.06, 0.08, 0.15, 0.18, 0.16, 0.12, 0.08, 0.03, 0.02];
    
    return months.map((month, index) => ({
      month,
      rainfall: Math.round(annual * distribution[index]),
      rainyDays: this.calculateRainyDays(annual * distribution[index]),
      intensity: this.getIntensity(annual * distribution[index])
    }));
  }

  private generateNorthIndiaPattern(months: string[], annual: number): MonthlyRainfall[] {
    const distribution = [0.02, 0.02, 0.03, 0.04, 0.06, 0.20, 0.25, 0.22, 0.12, 0.03, 0.01, 0.01];
    
    return months.map((month, index) => ({
      month,
      rainfall: Math.round(annual * distribution[index]),
      rainyDays: this.calculateRainyDays(annual * distribution[index]),
      intensity: this.getIntensity(annual * distribution[index])
    }));
  }

  private calculateRainyDays(monthlyRainfall: number): number {
    if (monthlyRainfall > 300) return Math.round(20 + Math.random() * 8);
    if (monthlyRainfall > 150) return Math.round(12 + Math.random() * 8);
    if (monthlyRainfall > 50) return Math.round(5 + Math.random() * 7);
    if (monthlyRainfall > 10) return Math.round(2 + Math.random() * 4);
    return Math.round(Math.random() * 2);
  }

  private getIntensity(monthlyRainfall: number): 'low' | 'medium' | 'high' {
    if (monthlyRainfall > 200) return 'high';
    if (monthlyRainfall > 50) return 'medium';
    return 'low';
  }

  private generateGroundwaterData(location: string, coordinates: { lat: number; lng: number }): GroundwaterData {
    const baseDepth = this.estimateGroundwaterDepth(coordinates);
    
    return {
      location,
      coordinates,
      depth: baseDepth,
      quality: this.estimateWaterQuality(coordinates),
      aquiferType: this.estimateAquiferType(coordinates),
      seasonalVariation: {
        preMonsoon: baseDepth + 2,
        monsoon: baseDepth - 1,
        postMonsoon: baseDepth
      },
      rechargeRate: this.estimateRechargeRate(coordinates),
      lastUpdated: new Date().toISOString()
    };
  }

  private estimateGroundwaterDepth(coordinates: { lat: number; lng: number }): number {
    const { lat, lng } = coordinates;
    
    // Estimates based on hydrogeological patterns
    if (lat >= 24 && lat <= 30 && lng >= 74 && lng <= 78) return 25; // Rajasthan - deep
    if (lat >= 28 && lat <= 30 && lng >= 76 && lng <= 78) return 15; // Delhi region
    if (lat >= 18 && lat <= 22 && lng >= 72 && lng <= 76) return 12; // Maharashtra
    if (lat >= 8 && lat <= 15 && lng >= 75 && lng <= 80) return 8;   // South India
    if (lat >= 22 && lat <= 26 && lng >= 85 && lng <= 90) return 6;  // Bengal basin
    
    return 10; // Default
  }

  private estimateWaterQuality(coordinates: { lat: number; lng: number }): string {
    const random = Math.random();
    if (random > 0.7) return 'Excellent (TDS < 300 mg/L)';
    if (random > 0.4) return 'Good (TDS 300-600 mg/L)';
    if (random > 0.2) return 'Fair (TDS 600-900 mg/L)';
    return 'Poor (TDS > 900 mg/L)';
  }

  private estimateAquiferType(coordinates: { lat: number; lng: number }): string {
    const { lat } = coordinates;
    
    if (lat >= 25) return 'Alluvial Aquifer';
    if (lat >= 15) return 'Hard Rock Aquifer';
    return 'Sedimentary Aquifer';
  }

  private estimateRechargeRate(coordinates: { lat: number; lng: number }): number {
    const annualRainfall = this.estimateAnnualRainfall(coordinates);
    return Math.round((annualRainfall / 1000) * 15); // Rough estimate: 15% of rainfall
  }

  // City-specific rainfall patterns
  private generateMumbaiRainfall(): MonthlyRainfall[] {
    const data = [45, 25, 15, 10, 20, 485, 610, 540, 340, 125, 35, 15];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateDelhiRainfall(): MonthlyRainfall[] {
    const data = [15, 18, 20, 12, 25, 65, 180, 165, 125, 35, 8, 5];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateBangaloreRainfall(): MonthlyRainfall[] {
    const data = [8, 12, 25, 45, 85, 65, 95, 125, 165, 185, 65, 25];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateHyderabadRainfall(): MonthlyRainfall[] {
    const data = [12, 15, 18, 25, 35, 95, 155, 145, 125, 85, 25, 15];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateChennaiRainfall(): MonthlyRainfall[] {
    const data = [25, 15, 20, 35, 55, 45, 85, 115, 125, 285, 345, 95];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateKolkataRainfall(): MonthlyRainfall[] {
    const data = [15, 25, 35, 45, 125, 285, 325, 295, 245, 125, 25, 15];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generatePuneRainfall(): MonthlyRainfall[] {
    const data = [8, 5, 12, 15, 25, 125, 185, 145, 125, 65, 15, 8];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateAhmedabadRainfall(): MonthlyRainfall[] {
    const data = [5, 8, 12, 15, 18, 125, 185, 165, 125, 45, 12, 5];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateJaipurRainfall(): MonthlyRainfall[] {
    const data = [8, 12, 15, 18, 25, 65, 185, 155, 85, 25, 8, 5];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateKochiRainfall(): MonthlyRainfall[] {
    const data = [25, 45, 85, 185, 285, 585, 485, 385, 285, 385, 185, 85];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }

  private generateDefaultMonthlyRainfall(): MonthlyRainfall[] {
    const data = [15, 18, 25, 35, 45, 125, 185, 165, 125, 85, 25, 15];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      month,
      rainfall: data[index],
      rainyDays: this.calculateRainyDays(data[index]),
      intensity: this.getIntensity(data[index])
    }));
  }
}

export const rainfallApiService = new RainfallApiService();