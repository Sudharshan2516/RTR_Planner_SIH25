import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  projectName: string;
  location: string;
  roofArea: number;
  dwellers: number;
  harvestPotential: {
    annualHarvest: number;
    annualRainfall: number;
    waterQuality: number;
    runoffCoefficient: number;
  };
  structure: {
    type: string;
    capacity: number;
    cost: number;
    installationDays: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  costAnalysis: {
    totalCost: number;
    annualSavings: number;
    paybackPeriod: number;
    roi: number;
  };
  generatedAt: string;
  userName: string;
}

export const generatePDFReport = async (data: ReportData, language: string = 'english'): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Set font
  pdf.setFont('helvetica');
  
  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(16, 185, 129); // Green color
  pdf.text('AquaHarvest', 20, 25);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  const title = language === 'hindi' ? 'वर्षा जल संचयन मूल्यांकन रिपोर्ट' :
                language === 'telugu' ? 'వర్షపు నీటి సేకరణ అంచనా నివేదిక' :
                'Rainwater Harvesting Assessment Report';
  pdf.text(title, 20, 40);
  
  // Project Info
  let yPos = 60;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const projectInfo = [
    [`Project Name: ${data.projectName}`, `प्रोजेक्ट नाम: ${data.projectName}`, `ప్రాజెక్ట్ పేరు: ${data.projectName}`],
    [`Location: ${data.location}`, `स्थान: ${data.location}`, `స్థానం: ${data.location}`],
    [`Roof Area: ${data.roofArea} sq.m`, `छत क्षेत्र: ${data.roofArea} वर्ग मी`, `పైకప్పు వైశాల్యం: ${data.roofArea} చ.మీ`],
    [`Number of People: ${data.dwellers}`, `लोगों की संख्या: ${data.dwellers}`, `వ్యక్తుల సంఖ్య: ${data.dwellers}`],
    [`Generated: ${data.generatedAt}`, `उत्पन्न: ${data.generatedAt}`, `రూపొందించబడింది: ${data.generatedAt}`],
    [`User: ${data.userName}`, `उपयोगकर्ता: ${data.userName}`, `వినియోగదారు: ${data.userName}`]
  ];
  
  const langIndex = language === 'hindi' ? 1 : language === 'telugu' ? 2 : 0;
  
  projectInfo.forEach((info) => {
    pdf.text(info[langIndex], 20, yPos);
    yPos += 10;
  });
  
  // Harvest Potential Section
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setTextColor(59, 130, 246); // Blue color
  const harvestTitle = language === 'hindi' ? 'संचयन क्षमता' :
                      language === 'telugu' ? 'సేకరణ సామర్థ్యం' :
                      'Harvest Potential';
  pdf.text(harvestTitle, 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const harvestData = [
    [`Annual Harvest: ${data.harvestPotential.annualHarvest.toLocaleString()} L`, 
     `वार्षिक संचयन: ${data.harvestPotential.annualHarvest.toLocaleString()} ली`,
     `వార్షిక సేకరణ: ${data.harvestPotential.annualHarvest.toLocaleString()} లీ`],
    [`Annual Rainfall: ${data.harvestPotential.annualRainfall} mm`,
     `वार्षिक वर्षा: ${data.harvestPotential.annualRainfall} मिमी`,
     `వార్షిక వర్షపాతం: ${data.harvestPotential.annualRainfall} మిమీ`],
    [`Water Quality Score: ${data.harvestPotential.waterQuality}%`,
     `जल गुणवत्ता स्कोर: ${data.harvestPotential.waterQuality}%`,
     `నీటి నాణ్యత స్కోర్: ${data.harvestPotential.waterQuality}%`],
    [`Runoff Coefficient: ${data.harvestPotential.runoffCoefficient}`,
     `अपवाह गुणांक: ${data.harvestPotential.runoffCoefficient}`,
     `రన్‌ఆఫ్ కోఎఫిషియంట్: ${data.harvestPotential.runoffCoefficient}`]
  ];
  
  harvestData.forEach((info) => {
    pdf.text(info[langIndex], 25, yPos);
    yPos += 8;
  });
  
  // Structure Recommendation Section
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setTextColor(16, 185, 129); // Green color
  const structureTitle = language === 'hindi' ? 'अनुशंसित संरचना' :
                         language === 'telugu' ? 'సిఫార్సు చేసిన నిర్మాణం' :
                         'Recommended Structure';
  pdf.text(structureTitle, 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const structureData = [
    [`Type: ${data.structure.type.replace('_', ' ').toUpperCase()}`,
     `प्रकार: ${data.structure.type.replace('_', ' ').toUpperCase()}`,
     `రకం: ${data.structure.type.replace('_', ' ').toUpperCase()}`],
    [`Capacity: ${data.structure.capacity.toLocaleString()} L`,
     `क्षमता: ${data.structure.capacity.toLocaleString()} ली`,
     `సామర్థ్యం: ${data.structure.capacity.toLocaleString()} లీ`],
    [`Estimated Cost: ₹${data.structure.cost.toLocaleString()}`,
     `अनुमानित लागत: ₹${data.structure.cost.toLocaleString()}`,
     `అంచనా వ్యయం: ₹${data.structure.cost.toLocaleString()}`],
    [`Installation Time: ${data.structure.installationDays} days`,
     `स्थापना समय: ${data.structure.installationDays} दिन`,
     `ఇన్‌స్టాలేషన్ సమయం: ${data.structure.installationDays} రోజులు`],
    [`Dimensions: ${data.structure.dimensions.length}m × ${data.structure.dimensions.width}m × ${data.structure.dimensions.height}m`,
     `आयाम: ${data.structure.dimensions.length}मी × ${data.structure.dimensions.width}मी × ${data.structure.dimensions.height}मी`,
     `కొలతలు: ${data.structure.dimensions.length}మీ × ${data.structure.dimensions.width}మీ × ${data.structure.dimensions.height}మీ`]
  ];
  
  structureData.forEach((info) => {
    pdf.text(info[langIndex], 25, yPos);
    yPos += 8;
  });
  
  // Cost Analysis Section
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setTextColor(245, 158, 11); // Yellow color
  const costTitle = language === 'hindi' ? 'लागत विश्लेषण' :
                    language === 'telugu' ? 'వ్యయ విశ్లేషణ' :
                    'Cost Analysis';
  pdf.text(costTitle, 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  const costData = [
    [`Total Investment: ₹${data.costAnalysis.totalCost.toLocaleString()}`,
     `कुल निवेश: ₹${data.costAnalysis.totalCost.toLocaleString()}`,
     `మొత్తం పెట్టుబడి: ₹${data.costAnalysis.totalCost.toLocaleString()}`],
    [`Annual Savings: ₹${data.costAnalysis.annualSavings.toLocaleString()}`,
     `वार्षिक बचत: ₹${data.costAnalysis.annualSavings.toLocaleString()}`,
     `వార్షిక ఆదా: ₹${data.costAnalysis.annualSavings.toLocaleString()}`],
    [`Payback Period: ${data.costAnalysis.paybackPeriod} years`,
     `वापसी अवधि: ${data.costAnalysis.paybackPeriod} वर्ष`,
     `తిరిగి రావడం కాలం: ${data.costAnalysis.paybackPeriod} సంవత్సరాలు`],
    [`Annual ROI: ${data.costAnalysis.roi}%`,
     `वार्षिक ROI: ${data.costAnalysis.roi}%`,
     `వార్షిక ROI: ${data.costAnalysis.roi}%`]
  ];
  
  costData.forEach((info) => {
    pdf.text(info[langIndex], 25, yPos);
    yPos += 8;
  });
  
  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by AquaHarvest Platform', 20, pageHeight - 20);
  pdf.text(`Report ID: ${Date.now()}`, 20, pageHeight - 10);
  
  // Save the PDF
  const fileName = `rainwater-harvesting-report-${data.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
};

export const generateReportFromElement = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
};