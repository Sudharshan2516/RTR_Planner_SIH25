// ML API Integration Service

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_BASE_URL || 'https://api.example.com/v1';
const ML_API_TOKEN = import.meta.env.VITE_ML_API_TOKEN || 'demo-token';

export interface MLQuickPayload {
  lat: number;
  lon: number;
  roof_area_m2: number;
  roof_type: string;
  open_space_m2: number;
  dwellers: number;
  use_ml: boolean;
}

export interface MLQuickResponse {
  feasibility: string;
  gross_harvest_m3: number;
  confidence_score: number;
  used_fallback: boolean;
  model_version: string;
  factors: string[];
}

export interface MLFullPayload extends MLQuickPayload {
  project_id: string;
  address: string;
  photos?: string[];
  notes?: string;
}

export interface MLFullResponse extends MLQuickResponse {
  monthly_breakdown: number[];
  structure_recommendation: {
    type: string;
    dimensions: any;
    cost_estimate: number;
  };
  recharge_analysis: {
    soil_type: string;
    permeability: string;
    recharge_rate: number;
  };
}

export interface ImageValidatePayload {
  image_url: string;
  image_type: 'roof' | 'site';
}

export interface ImageValidateResponse {
  roof_area_detected: number;
  obstruction_score: number;
  confidence: number;
  annotations: any[];
}

class MLApiService {
  private async makeRequest<T>(endpoint: string, payload: any): Promise<T> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ML_API_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ML API request failed:', error);
      throw error;
    }
  }

  async predictQuick(payload: MLQuickPayload): Promise<MLQuickResponse> {
    try {
      return await this.makeRequest<MLQuickResponse>('/predict/quick', payload);
    } catch (error) {
      // Return fallback response
      return {
        feasibility: 'medium',
        gross_harvest_m3: payload.roof_area_m2 * 0.8 * 0.8, // Fallback calculation
        confidence_score: 0.5,
        used_fallback: true,
        model_version: 'fallback-v1',
        factors: ['Fallback calculation used', 'ML service unavailable']
      };
    }
  }

  async predictFull(payload: MLFullPayload): Promise<MLFullResponse> {
    try {
      return await this.makeRequest<MLFullResponse>('/predict/full', payload);
    } catch (error) {
      // Return fallback response with more details
      const quick_result = await this.predictQuick(payload);
      return {
        ...quick_result,
        monthly_breakdown: Array(12).fill(quick_result.gross_harvest_m3 / 12),
        structure_recommendation: {
          type: 'Underground Tank',
          dimensions: { diameter_m: 3.0, depth_m: 2.5 },
          cost_estimate: 150000
        },
        recharge_analysis: {
          soil_type: 'Medium Clay',
          permeability: 'medium',
          recharge_rate: 0.6
        }
      };
    }
  }

  async validateImage(payload: ImageValidatePayload): Promise<ImageValidateResponse> {
    try {
      return await this.makeRequest<ImageValidateResponse>('/image/validate', payload);
    } catch (error) {
      // Return fallback response
      return {
        roof_area_detected: 100, // Default estimate
        obstruction_score: 0.1,
        confidence: 0.3,
        annotations: []
      };
    }
  }

  // Retry mechanism with exponential backoff
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export const mlApiService = new MLApiService();