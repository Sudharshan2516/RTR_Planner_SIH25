export interface ProcessingJob {
  id: string;
  type: 'ml_prediction' | 'report_generation' | 'data_analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class AsyncProcessor {
  private jobs: Map<string, ProcessingJob> = new Map();
  private workers: Map<string, Worker | null> = new Map();

  async submitJob(type: ProcessingJob['type'], data: any): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ProcessingJob = {
      id: jobId,
      type,
      status: 'pending',
      progress: 0,
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.jobs.set(jobId, job);
    
    // Start processing immediately
    this.processJob(jobId);
    
    return jobId;
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    return this.jobs.get(jobId) || null;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);

      let result: any;

      switch (job.type) {
        case 'ml_prediction':
          result = await this.processMlPrediction(job);
          break;
        case 'report_generation':
          result = await this.processReportGeneration(job);
          break;
        case 'data_analysis':
          result = await this.processDataAnalysis(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.progress = 100;
      job.result = result;
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  private async processMlPrediction(job: ProcessingJob): Promise<any> {
    const { roofArea, location, numDwellers, availableSpace, roofType } = job.data;
    
    // Simulate ML processing with progress updates
    for (let i = 0; i <= 100; i += 10) {
      job.progress = i;
      job.updatedAt = new Date();
      this.jobs.set(job.id, job);
      await this.delay(200); // Simulate processing time
    }

    // Simulate ML prediction calculations
    const locationRainfall: Record<string, number> = {
      'mumbai': 2200, 'delhi': 600, 'bangalore': 900, 'hyderabad': 800,
      'chennai': 1200, 'kolkata': 1600, 'pune': 700, 'ahmedabad': 800,
      'jaipur': 550, 'kochi': 3000, 'default': 800
    };

    const roofTypeCoefficients: Record<string, number> = {
      'concrete': 0.85, 'tiles': 0.75, 'metal': 0.90,
      'asbestos': 0.80, 'green': 0.40, 'default': 0.80
    };

    const cityKey = location.toLowerCase();
    const annualRainfall = locationRainfall[cityKey] || locationRainfall.default;
    const runoffCoefficient = roofTypeCoefficients[roofType.toLowerCase()] || roofTypeCoefficients.default;
    
    const predictedHarvestLiters = Math.round(
      roofArea * annualRainfall * runoffCoefficient * 0.001 * 1000
    );

    let waterQualityScore = 85;
    if (roofType === 'metal') waterQualityScore = 90;
    if (roofType === 'green') waterQualityScore = 95;
    if (roofType === 'asbestos') waterQualityScore = 70;

    const confidenceScore = cityKey in locationRainfall ? 0.9 : 0.7;

    return {
      annualRainfall,
      predictedHarvestLiters,
      runoffCoefficient,
      waterQualityScore,
      confidenceScore,
      processingTime: Date.now() - job.createdAt.getTime()
    };
  }

  private async processReportGeneration(job: ProcessingJob): Promise<any> {
    // Simulate report generation with progress updates
    const steps = [
      'Collecting data...',
      'Analyzing harvest potential...',
      'Calculating cost estimates...',
      'Generating structure recommendations...',
      'Creating visualizations...',
      'Compiling final report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      job.progress = Math.round(((i + 1) / steps.length) * 100);
      job.updatedAt = new Date();
      this.jobs.set(job.id, job);
      await this.delay(500); // Simulate processing time
    }

    return {
      reportUrl: `/reports/${job.id}.pdf`,
      generatedAt: new Date().toISOString(),
      fileSize: Math.round(Math.random() * 1000 + 500), // KB
      pages: Math.round(Math.random() * 5 + 3)
    };
  }

  private async processDataAnalysis(job: ProcessingJob): Promise<any> {
    // Simulate data analysis
    for (let i = 0; i <= 100; i += 5) {
      job.progress = i;
      job.updatedAt = new Date();
      this.jobs.set(job.id, job);
      await this.delay(100);
    }

    return {
      insights: [
        'High water conservation potential identified',
        'Optimal tank size calculated based on rainfall patterns',
        'ROI analysis shows positive returns within 3-5 years',
        'Environmental impact score: Excellent'
      ],
      recommendations: [
        'Install first flush diverter for better water quality',
        'Consider modular tank system for scalability',
        'Regular maintenance every 6 months recommended'
      ],
      metrics: {
        efficiency: Math.round(Math.random() * 20 + 80),
        sustainability: Math.round(Math.random() * 15 + 85),
        costEffectiveness: Math.round(Math.random() * 25 + 75)
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean up old jobs (call periodically)
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 hours default
    const now = Date.now();
    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt.getTime() > maxAge) {
        this.jobs.delete(jobId);
        const worker = this.workers.get(jobId);
        if (worker) {
          worker.terminate();
          this.workers.delete(jobId);
        }
      }
    }
  }
}

export const asyncProcessor = new AsyncProcessor();

// Auto cleanup every hour
setInterval(() => {
  asyncProcessor.cleanupOldJobs();
}, 60 * 60 * 1000);