import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'english' | 'hindi' | 'telugu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  english: {
    // Navigation
    'nav.home': 'Home',
    'nav.quick_check': 'Quick Check',
    'nav.feasibility': 'Feasibility Check',
    'nav.projects': 'My Projects',
    'nav.profile': 'Profile',
    'nav.contractor': 'Contractor Portal',
    'nav.admin': 'Admin Dashboard',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.notifications': 'Notifications',
    
    // Home page
    'home.hero.title': 'RainShare — Your Rooftop Rainwater Assistant',
    'home.hero.subtitle': 'Check feasibility, get recommendations, and harvest rainwater efficiently',
    'home.steps.location': 'Enter Location',
    'home.steps.check': 'Quick Check',
    'home.steps.report': 'Get Report',
    'home.cta.start': 'Start Quick Check',
    'home.about': 'About',
    'home.how_it_works': 'How it Works',
    'home.faqs': 'FAQs',
    
    // Quick Check
    'quick.title': 'Quick Feasibility Check',
    'quick.address': 'Address/PIN Code',
    'quick.latitude': 'Latitude',
    'quick.longitude': 'Longitude',
    'quick.roof_area': 'Roof Area (m²)',
    'quick.roof_type': 'Roof Type',
    'quick.open_space': 'Open Space (m²)',
    'quick.dwellers': 'Number of Dwellers',
    'quick.submit': 'Check Feasibility',
    'quick.geolocate': 'Use My Location',
    'quick.groundwater_depth': 'Groundwater Depth (m)',
    
    // Results
    'result.feasibility': 'Feasibility',
    'result.harvest': 'Annual Harvest',
    'result.structure': 'Recommended Structure',
    'result.high': 'High',
    'result.medium': 'Medium',
    'result.low': 'Low',
    'result.register_cta': 'Register to Save & Get Full Report',
    'result.ai_recommendation': 'AI Recommendation',
    'result.confidence': 'Confidence Level',
    'result.alternatives': 'Alternative Options',
    'result.what_if': 'What-If Analysis',
    'result.download_report': 'Download Report',
    'result.environmental_impact': 'Environmental Impact',
    
    // Project Form
    'project.name': 'Project Name',
    'project.photos': 'Upload Photos (up to 5)',
    'project.notes': 'Additional Notes',
    'project.save_draft': 'Save Draft',
    'project.submit_predict': 'Submit for Prediction',
    'project.request_quote': 'Request Contractor Quote',
    'project.generate_pdf': 'Generate PDF Report',
    
    // Feasibility Scores
    'feasibility.excellent': 'Excellent',
    'feasibility.good': 'Good',
    'feasibility.fair': 'Fair',
    'feasibility.poor': 'Poor',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.view': 'View',
    'common.edit': 'Edit',
    
    // Roof Types
    'roof.rcc': 'RCC/Concrete',
    'roof.metal': 'Metal Sheets',
    'roof.tile': 'Clay Tiles',
    'roof.other': 'Other',
    
    // Status
    'status.draft': 'Draft',
    'status.submitted': 'Submitted',
    'status.predicted': 'Predicted',
    'status.verified': 'Verified',
    'status.rejected': 'Rejected',
    
    // Reports
    'report.annual_harvest': 'Annual Harvest',
    'report.annual_savings': 'Annual Savings',
    'report.payback_period': 'Payback Period',
    'report.roi': 'Return on Investment',
    'report.generating': 'Generating...',
    'report.download': 'Download PDF',
    
    // Gamification
    'points.earned': 'Points Earned',
    'badges.title': 'Your Badges',
    'leaderboard.title': 'Community Leaderboard',
    
    // Admin
    'admin.total_projects': 'Total Projects',
    'admin.verified_projects': 'Verified Projects',
    'admin.estimated_recharge': 'Estimated Recharge (m³)',
    'admin.top_regions': 'Top Regions',
    'admin.manage_users': 'Manage Users',
    'admin.recent_projects': 'Recent Projects',
    
    // Contractor
    'contractor.business_name': 'Business Name',
    'contractor.service_areas': 'Service Areas',
    'contractor.rating': 'Rating',
    'contractor.inbox': 'Project Requests',
    'contractor.respond_quote': 'Respond with Quote',
    'contractor.dashboard': 'కాంట్రాక్టర్ డాష్‌బోర్డ్',
    'contractor.active_requests': 'క్రియాశీల అభ్యర్థనలు',
    'contractor.pending_quotes': 'పెండింగ్ కోట్లు',
    'contractor.completed_projects': 'పూర్తయిన ప్రాజెక్టులు',
    'contractor.total_earnings': 'మొత్తం ఆదాయాలు',
    'contractor.submit_quote': 'కోట్ సమర్పించండి',
    'contractor.quote_amount': 'కోట్ మొత్తం',
    'contractor.timeline': 'కాలపరిమితి',
    'contractor.warranty': 'వారంటీ',
    'contractor.materials': 'మెటీరియల్స్',
    'contractor.dashboard': 'ठेकेदार डैशबोर्ड',
    'contractor.active_requests': 'सक्रिय अनुरोध',
    'contractor.pending_quotes': 'लंबित उद्धरण',
    'contractor.completed_projects': 'पूर्ण परियोजनाएं',
    'contractor.total_earnings': 'कुल आय',
    'contractor.submit_quote': 'उद्धरण जमा करें',
    'contractor.quote_amount': 'उद्धरण राशि',
    'contractor.timeline': 'समयसीमा',
    'contractor.warranty': 'वारंटी',
    'contractor.materials': 'सामग्री',
    'contractor.dashboard': 'Contractor Dashboard',
    'contractor.active_requests': 'Active Requests',
    'contractor.pending_quotes': 'Pending Quotes',
    'contractor.completed_projects': 'Completed Projects',
    'contractor.total_earnings': 'Total Earnings',
    'contractor.submit_quote': 'Submit Quote',
    'contractor.quote_amount': 'Quote Amount',
    'contractor.timeline': 'Timeline',
    'contractor.warranty': 'Warranty',
    'contractor.materials': 'Materials',
    
    // Form Labels
    'form.roof_area': 'Roof Area',
    'form.dwellers': 'Number of People',
    'form.available_space': 'Available Space',
    'form.groundwater_depth': 'Groundwater Depth',
    
    // Notifications
    'notif.ml_unavailable': 'ML service unavailable - showing rule-based result',
    'notif.low_confidence': 'Low confidence - request verification recommended',
    'notif.project_saved': 'Project saved successfully',
    'notif.quote_requested': 'Quote request sent to contractors',
    'notif.pdf_generated': 'PDF report generated successfully',
    'notification.mark_read': 'Mark as read',
    'notification.mark_all_read': 'Mark all as read',
    'notification.no_notifications': 'No notifications yet',
    'notification.report_ready': 'Report Ready'
  },
  hindi: {
    // Navigation
    'nav.home': 'होम',
    'nav.quick_check': 'त्वरित जांच',
    'nav.feasibility': 'व्यवहार्यता जांच',
    'nav.projects': 'मेरी परियोजनाएं',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.contractor': 'ठेकेदार पोर्टल',
    'nav.admin': 'एडमिन डैशबोर्ड',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.logout': 'लॉगआउट',
    'nav.notifications': 'सूचनाएं',
    
    // Home page
    'home.hero.title': 'रेनशेयर — आपका छत वर्षा जल सहायक',
    'home.hero.subtitle': 'व्यवहार्यता जांचें, सिफारिशें प्राप्त करें, और कुशलता से वर्षा जल का संचयन करें',
    'home.steps.location': 'स्थान दर्ज करें',
    'home.steps.check': 'त्वरित जांच',
    'home.steps.report': 'रिपोर्ट प्राप्त करें',
    'home.cta.start': 'त्वरित जांच शुरू करें',
    'home.about': 'के बारे में',
    'home.how_it_works': 'यह कैसे काम करता है',
    'home.faqs': 'अक्सर पूछे जाने वाले प्रश्न',
    
    // Quick Check
    'quick.title': 'त्वरित व्यवहार्यता जांच',
    'quick.address': 'पता/पिन कोड',
    'quick.latitude': 'अक्षांश',
    'quick.longitude': 'देशांतर',
    'quick.roof_area': 'छत का क्षेत्रफल (वर्ग मीटर)',
    'quick.roof_type': 'छत का प्रकार',
    'quick.open_space': 'खुला स्थान (वर्ग मीटर)',
    'quick.dwellers': 'निवासियों की संख्या',
    'quick.submit': 'व्यवहार्यता जांचें',
    'quick.geolocate': 'मेरा स्थान उपयोग करें',
    'quick.groundwater_depth': 'भूजल गहराई (मीटर)',
    
    // Results
    'result.feasibility': 'व्यवहार्यता',
    'result.harvest': 'वार्षिक संचयन',
    'result.structure': 'अनुशंसित संरचना',
    'result.high': 'उच्च',
    'result.medium': 'मध्यम',
    'result.low': 'निम्न',
    'result.register_cta': 'पूर्ण रिपोर्ट सहेजने और प्राप्त करने के लिए पंजीकरण करें',
    'result.ai_recommendation': 'AI सिफारिश',
    'result.confidence': 'विश्वास स्तर',
    'result.alternatives': 'वैकल्पिक विकल्प',
    'result.what_if': 'क्या-यदि विश्लेषण',
    'result.download_report': 'रिपोर्ट डाउनलोड करें',
    'result.environmental_impact': 'पर्यावरणीय प्रभाव',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.submit': 'जमा करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.close': 'बंद करें',
    'common.view': 'देखें',
    'common.edit': 'संपादित करें',
    
    // Form Labels
    'form.roof_area': 'छत का क्षेत्रफल',
    'form.dwellers': 'लोगों की संख्या',
    'form.available_space': 'उपलब्ध स्थान',
    'form.groundwater_depth': 'भूजल गहराई'
  },
  telugu: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.quick_check': 'త్వరిత తనిఖీ',
    'nav.feasibility': 'సాధ్యత తనిఖీ',
    'nav.projects': 'నా ప్రాజెక్టులు',
    'nav.profile': 'ప్రొఫైల్',
    'nav.contractor': 'కాంట్రాక్టర్ పోర్టల్',
    'nav.admin': 'అడ్మిన్ డాష్‌బోర్డ్',
    'nav.login': 'లాగిన్',
    'nav.signup': 'సైన్ అప్',
    'nav.logout': 'లాగౌట్',
    'nav.notifications': 'నోటిఫికేషన్లు',
    
    // Home page
    'home.hero.title': 'రెయిన్‌షేర్ — మీ పైకప్పు వర్షపు నీటి సహాయకుడు',
    'home.hero.subtitle': 'సాధ్యత తనిఖీ చేయండి, సిఫార్సులు పొందండి, మరియు సమర్థవంతంగా వర్షపు నీటిని సేకరించండి',
    'home.steps.location': 'స్థానం నమోదు చేయండి',
    'home.steps.check': 'త్వరిత తనిఖీ',
    'home.steps.report': 'నివేదిక పొందండి',
    'home.cta.start': 'త్వరిత తనిఖీ ప్రారంభించండి',
    'home.about': 'గురించి',
    'home.how_it_works': 'ఇది ఎలా పనిచేస్తుంది',
    'home.faqs': 'తరచుగా అడిగే ప్రశ్నలు',
    
    // Quick Check
    'quick.title': 'త్వరిత సాధ్యత తనిఖీ',
    'quick.address': 'చిరునామా/పిన్ కోడ్',
    'quick.latitude': 'అక్షాంశం',
    'quick.longitude': 'రేఖాంశం',
    'quick.roof_area': 'పైకప్పు వైశాల్యం (చ.మీ)',
    'quick.roof_type': 'పైకప్పు రకం',
    'quick.open_space': 'బహిరంగ స్థలం (చ.మీ)',
    'quick.dwellers': 'నివాసుల సంఖ్య',
    'quick.submit': 'సాధ్యత తనిఖీ చేయండి',
    'quick.geolocate': 'నా స్థానాన్ని ఉపయోగించండి',
    'quick.groundwater_depth': 'భూగర్భ జల లోతు (మీటర్లు)',
    
    // Results
    'result.feasibility': 'సాధ్యత',
    'result.harvest': 'వార్షిక సేకరణ',
    'result.structure': 'సిఫార్సు చేసిన నిర్మాణం',
    'result.high': 'అధిక',
    'result.medium': 'మధ్యమ',
    'result.low': 'తక్కువ',
    'result.register_cta': 'పూర్తి నివేదికను సేవ్ చేయడానికి మరియు పొందడానికి నమోదు చేసుకోండి',
    'result.ai_recommendation': 'AI సిఫార్సు',
    'result.confidence': 'విశ్వాస స్థాయి',
    'result.alternatives': 'ప్రత్యామ్నాయ ఎంపికలు',
    'result.what_if': 'ఏమైతే విశ్లేషణ',
    'result.download_report': 'నివేదిక డౌన్‌లోడ్ చేయండి',
    'result.environmental_impact': 'పర్యావరణ ప్రభావం',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    'common.cancel': 'రద్దు చేయండి',
    'common.save': 'సేవ్ చేయండి',
    'common.submit': 'సమర్పించండి',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.close': 'మూసివేయండి',
    'common.view': 'చూడండి',
    'common.edit': 'సవరించండి',
    
    // Form Labels
    'form.roof_area': 'పైకప్పు వైశాల్యం',
    'form.dwellers': 'వ్యక్తుల సంఖ్య',
    'form.available_space': 'అందుబాటులో ఉన్న స్థలం',
    'form.groundwater_depth': 'భూగర్భ జల లోతు'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('aquaharvest_language');
    return (saved as Language) || 'english';
  });

  useEffect(() => {
    localStorage.setItem('aquaharvest_language', language);
    document.documentElement.lang = language === 'english' ? 'en' : language === 'hindi' ? 'hi' : 'te';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};