import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Clock, MapPin, FileText, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  required: boolean;
  documents?: string[];
  photos?: string[];
  notes?: string;
  completedAt?: Date;
  verifiedBy?: string;
}

interface FieldVerificationWorkflowProps {
  projectId: string;
  onStatusChange?: (status: string) => void;
}

const FieldVerificationWorkflow: React.FC<FieldVerificationWorkflowProps> = ({
  projectId,
  onStatusChange
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [overallStatus, setOverallStatus] = useState<'pending' | 'in_progress' | 'completed' | 'rejected'>('pending');

  useEffect(() => {
    initializeVerificationSteps();
  }, [projectId]);

  const initializeVerificationSteps = () => {
    const steps: VerificationStep[] = [
      {
        id: 'site_inspection',
        title: 'Site Inspection',
        description: 'Physical verification of roof area, available space, and site conditions',
        status: 'pending',
        required: true,
        documents: [],
        photos: [],
        notes: ''
      },
      {
        id: 'roof_assessment',
        title: 'Roof Assessment',
        description: 'Detailed evaluation of roof type, structural integrity, and water collection potential',
        status: 'pending',
        required: true,
        documents: [],
        photos: [],
        notes: ''
      },
      {
        id: 'groundwater_verification',
        title: 'Groundwater Verification',
        description: 'Verification of groundwater depth and soil permeability through local sources',
        status: 'pending',
        required: true,
        documents: [],
        photos: [],
        notes: ''
      },
      {
        id: 'space_measurement',
        title: 'Space Measurement',
        description: 'Accurate measurement of available space for system installation',
        status: 'pending',
        required: true,
        documents: [],
        photos: [],
        notes: ''
      },
      {
        id: 'regulatory_check',
        title: 'Regulatory Compliance',
        description: 'Check local regulations and obtain necessary approvals',
        status: 'pending',
        required: false,
        documents: [],
        photos: [],
        notes: ''
      },
      {
        id: 'final_report',
        title: 'Final Verification Report',
        description: 'Compilation of all findings and final recommendation',
        status: 'pending',
        required: true,
        documents: [],
        photos: [],
        notes: ''
      }
    ];

    // Load existing data from localStorage
    const savedSteps = localStorage.getItem(`verification_${projectId}`);
    if (savedSteps) {
      try {
        const parsed = JSON.parse(savedSteps);
        setVerificationSteps(parsed.map((step: any) => ({
          ...step,
          completedAt: step.completedAt ? new Date(step.completedAt) : undefined
        })));
        setOverallStatus(localStorage.getItem(`verification_status_${projectId}`) as any || 'pending');
      } catch (error) {
        console.error('Error loading verification data:', error);
        setVerificationSteps(steps);
      }
    } else {
      setVerificationSteps(steps);
    }
  };

  const updateStep = (stepId: string, updates: Partial<VerificationStep>) => {
    setVerificationSteps(prev => {
      const updated = prev.map(step => 
        step.id === stepId 
          ? { ...step, ...updates, completedAt: updates.status === 'completed' ? new Date() : step.completedAt }
          : step
      );
      
      // Save to localStorage
      localStorage.setItem(`verification_${projectId}`, JSON.stringify(updated));
      
      // Update overall status
      const newOverallStatus = calculateOverallStatus(updated);
      setOverallStatus(newOverallStatus);
      localStorage.setItem(`verification_status_${projectId}`, newOverallStatus);
      onStatusChange?.(newOverallStatus);
      
      return updated;
    });
  };

  const calculateOverallStatus = (steps: VerificationStep[]): 'pending' | 'in_progress' | 'completed' | 'rejected' => {
    const requiredSteps = steps.filter(step => step.required);
    const completedRequired = requiredSteps.filter(step => step.status === 'completed');
    const rejectedSteps = steps.filter(step => step.status === 'rejected');
    const inProgressSteps = steps.filter(step => step.status === 'in_progress');

    if (rejectedSteps.length > 0) return 'rejected';
    if (completedRequired.length === requiredSteps.length) return 'completed';
    if (inProgressSteps.length > 0 || completedRequired.length > 0) return 'in_progress';
    return 'pending';
  };

  const handleFileUpload = async (stepId: string, files: FileList, type: 'documents' | 'photos') => {
    setUploadingFiles(prev => new Set(prev).add(stepId));
    
    try {
      // Simulate file upload (in real app, upload to cloud storage)
      const uploadedFiles: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock URL (in real app, this would be the actual uploaded file URL)
        const mockUrl = `https://storage.example.com/${projectId}/${stepId}/${file.name}`;
        uploadedFiles.push(mockUrl);
      }
      
      // Update step with new files
      const step = verificationSteps.find(s => s.id === stepId);
      if (step) {
        const currentFiles = type === 'documents' ? step.documents || [] : step.photos || [];
        updateStep(stepId, {
          [type]: [...currentFiles, ...uploadedFiles],
          status: step.status === 'pending' ? 'in_progress' : step.status
        });
      }
      
      addNotification({
        title: 'Files Uploaded',
        message: `${files.length} file(s) uploaded successfully for ${step?.title}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('File upload error:', error);
      addNotification({
        title: 'Upload Failed',
        message: 'Failed to upload files. Please try again.',
        type: 'error'
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
  };

  const handleNotesUpdate = (stepId: string, notes: string) => {
    updateStep(stepId, { notes });
  };

  const handleStatusChange = (stepId: string, status: VerificationStep['status']) => {
    updateStep(stepId, { 
      status,
      verifiedBy: user?.full_name || 'System'
    });
    
    if (status === 'completed') {
      addNotification({
        title: 'Step Completed',
        message: `Verification step "${verificationSteps.find(s => s.id === stepId)?.title}" has been completed.`,
        type: 'success'
      });
    }
  };

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Field Verification Workflow</h3>
            <p className="text-blue-100 text-sm">Project ID: {projectId}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completedSteps}/{totalSteps}</div>
            <div className="text-sm text-blue-100">Steps Completed</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-blue-100 mt-1">
            <span>0%</span>
            <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Overall Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(overallStatus)}`}>
            {overallStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="p-6">
        <div className="space-y-6">
          {verificationSteps.map((step, index) => (
            <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Step Header */}
              <div className={`p-4 border-b ${step.status === 'completed' ? 'bg-green-50' : 
                step.status === 'in_progress' ? 'bg-yellow-50' : 
                step.status === 'rejected' ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {index + 1}. {step.title}
                        {step.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {user?.role === 'admin' || user?.role === 'contractor' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(step.id, 'in_progress')}
                        disabled={step.status === 'in_progress'}
                        className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleStatusChange(step.id, 'completed')}
                        disabled={step.status === 'completed'}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(step.id, 'rejected')}
                        disabled={step.status === 'rejected'}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Step Content */}
              {(step.status === 'in_progress' || step.status === 'completed') && (
                <div className="p-4 space-y-4">
                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Documents */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Documents
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => e.target.files && handleFileUpload(step.id, e.target.files, 'documents')}
                          className="hidden"
                          id={`docs-${step.id}`}
                          disabled={uploadingFiles.has(step.id)}
                        />
                        <label
                          htmlFor={`docs-${step.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploadingFiles.has(step.id) ? 'Uploading...' : 'Upload Documents'}
                          </span>
                        </label>
                        
                        {step.documents && step.documents.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step.documents.map((doc, idx) => (
                              <div key={idx} className="text-xs text-blue-600 truncate">
                                📄 Document {idx + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Camera className="inline h-4 w-4 mr-1" />
                        Photos
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleFileUpload(step.id, e.target.files, 'photos')}
                          className="hidden"
                          id={`photos-${step.id}`}
                          disabled={uploadingFiles.has(step.id)}
                        />
                        <label
                          htmlFor={`photos-${step.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {uploadingFiles.has(step.id) ? 'Uploading...' : 'Upload Photos'}
                          </span>
                        </label>
                        
                        {step.photos && step.photos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step.photos.map((photo, idx) => (
                              <div key={idx} className="text-xs text-green-600 truncate">
                                📷 Photo {idx + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes & Observations
                    </label>
                    <textarea
                      value={step.notes || ''}
                      onChange={(e) => handleNotesUpdate(step.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add any notes, observations, or comments..."
                    />
                  </div>

                  {/* Completion Info */}
                  {step.status === 'completed' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed by {step.verifiedBy}</span>
                        {step.completedAt && (
                          <>
                            <Calendar className="h-4 w-4 ml-2" />
                            <span>{step.completedAt.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {user?.role === 'admin' && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                // Generate verification report
                addNotification({
                  title: 'Report Generated',
                  message: 'Field verification report has been generated successfully.',
                  type: 'success'
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Report
            </button>
            
            {overallStatus === 'completed' && (
              <button
                onClick={() => {
                  // Approve project
                  addNotification({
                    title: 'Project Approved',
                    message: 'Project has been approved based on field verification.',
                    type: 'success'
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldVerificationWorkflow;