import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, User, MapPin, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { generatePDFReport, ReportData } from '../utils/pdfGenerator';
import { asyncProcessor } from '../utils/asyncProcessor';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Mock reports data
    const mockReports = [
      {
        id: '1',
        projectName: 'Residential Rainwater Harvesting',
        location: 'Mumbai',
        roofArea: 150,
        dwellers: 4,
        generatedAt: '2024-01-15',
        status: 'completed',
        harvestPotential: {
          annualHarvest: 198000,
          annualRainfall: 2200,
          waterQuality: 85,
          runoffCoefficient: 0.85
        },
        structure: {
          type: 'underground_tank',
          capacity: 15000,
          cost: 125000,
          installationDays: 12,
          dimensions: { length: 4.2, width: 3.6, height: 2.5 }
        },
        costAnalysis: {
          totalCost: 125000,
          annualSavings: 15000,
          paybackPeriod: 8.3,
          roi: 12.0
        }
      },
      {
        id: '2',
        projectName: 'Community Water Conservation',
        location: 'Delhi',
        roofArea: 300,
        dwellers: 8,
        generatedAt: '2024-01-10',
        status: 'completed',
        harvestPotential: {
          annualHarvest: 153000,
          annualRainfall: 600,
          waterQuality: 90,
          runoffCoefficient: 0.85
        },
        structure: {
          type: 'modular_tank_system',
          capacity: 25000,
          cost: 185000,
          installationDays: 18,
          dimensions: { length: 5.5, width: 4.5, height: 2.8 }
        },
        costAnalysis: {
          totalCost: 185000,
          annualSavings: 22000,
          paybackPeriod: 8.4,
          roi: 11.9
        }
      }
    ];
    
    setReports(mockReports);
  }, []);

  const handleGenerateReport = async (report: any) => {
    setGeneratingReports(prev => new Set(prev).add(report.id));
    
    try {
      // Submit async job for report generation
      const jobId = await asyncProcessor.submitJob('report_generation', {
        reportId: report.id,
        projectName: report.projectName,
        userId: user?.id
      });

      // Simulate progress tracking
      const checkProgress = setInterval(async () => {
        const job = await asyncProcessor.getJobStatus(jobId);
        if (job?.status === 'completed') {
          clearInterval(checkProgress);
          
          // Generate the actual PDF
          const reportData: ReportData = {
            projectName: report.projectName,
            location: report.location,
            roofArea: report.roofArea,
            dwellers: report.dwellers,
            harvestPotential: report.harvestPotential,
            structure: report.structure,
            costAnalysis: report.costAnalysis,
            generatedAt: new Date().toLocaleDateString(),
            userName: user?.full_name || 'User'
          };

          await generatePDFReport(reportData, language);
          
          setGeneratingReports(prev => {
            const newSet = new Set(prev);
            newSet.delete(report.id);
            return newSet;
          });

          addNotification({
            title: t('notification.report_ready'),
            message: `Report for ${report.projectName} has been generated successfully.`,
            type: 'success',
            actionUrl: '/reports',
            actionText: 'View Reports'
          });
          
        } else if (job?.status === 'failed') {
          clearInterval(checkProgress);
          setGeneratingReports(prev => {
            const newSet = new Set(prev);
            newSet.delete(report.id);
            return newSet;
          });
          
          addNotification({
            title: 'Report Generation Failed',
            message: `Failed to generate report for ${report.projectName}.`,
            type: 'error'
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
      
      addNotification({
        title: 'Error',
        message: 'Failed to start report generation.',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.reports')}</h1>
          <p className="mt-2 text-gray-600">
            Generate and download detailed reports for your rainwater harvesting projects
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Report Header */}
              <div className="p-6 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{report.projectName}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-green-100">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{report.generatedAt}</span>
                      </div>
                    </div>
                  </div>
                  <FileText className="h-12 w-12 text-green-100" />
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {Math.round(report.harvestPotential.annualHarvest / 1000)}K L
                    </div>
                    <div className="text-sm text-blue-600">{t('report.annual_harvest')}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      ₹{Math.round(report.costAnalysis.annualSavings / 1000)}K
                    </div>
                    <div className="text-sm text-green-600">{t('report.annual_savings')}</div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('form.roof_area')}:</span>
                    <span className="font-medium">{report.roofArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('form.dwellers')}:</span>
                    <span className="font-medium">{report.dwellers} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tank Capacity:</span>
                    <span className="font-medium">{report.structure.capacity.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('report.payback_period')}:</span>
                    <span className="font-medium">{report.costAnalysis.paybackPeriod} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('report.roi')}:</span>
                    <span className="font-medium">{report.costAnalysis.roi}%</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                    {report.status.toUpperCase()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleGenerateReport(report)}
                    disabled={generatingReports.has(report.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {generatingReports.has(report.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('report.generating')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>{t('report.download')}</span>
                      </>
                    )}
                  </button>
                  
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    {t('common.view')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 mb-6">
              Complete a feasibility assessment to generate your first report.
            </p>
            <a
              href="/feasibility"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Assessment
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;