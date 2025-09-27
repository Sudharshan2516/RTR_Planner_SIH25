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
    'nav.feasibility': 'Feasibility Check',
    'nav.projects': 'My Projects',
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.leaderboard': 'Leaderboard',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    
    // Home page
    'home.hero.title': 'Transform Your Rooftop Into a Water Conservation Solution',
    'home.hero.subtitle': 'Harness the power of rainwater with smart, sustainable solutions tailored for your home',
    'home.cta.check': 'Check Feasibility',
    'home.cta.learn': 'Learn More',
    'home.stats.water_saved': 'Liters Saved Daily',
    'home.stats.projects': 'Projects Completed',
    'home.stats.cities': 'Cities Covered',
    'home.stats.success': 'Success Rate',
    
    // Features
    'features.assessment.title': 'Smart Assessment',
    'features.assessment.desc': 'AI-powered feasibility analysis for your rooftop',
    'features.structures.title': 'Custom Structures',
    'features.structures.desc': 'Tailored rainwater harvesting system designs',
    'features.tracking.title': 'Impact Tracking',
    'features.tracking.desc': 'Monitor your water savings and environmental impact',
    
    // Forms
    'form.project_name': 'Project Name',
    'form.roof_area': 'Roof Area (sq. meters)',
    'form.location': 'Location/City',
    'form.dwellers': 'Number of People',
    'form.available_space': 'Available Space (sq. meters)',
    'form.roof_type': 'Roof Type',
    'form.calculate': 'Calculate Feasibility',
    'form.calculating': 'Calculating...',
    
    // Reports
    'report.title': 'Rainwater Harvesting Assessment Report',
    'report.download': 'Download PDF Report',
    'report.generating': 'Generating Report...',
    'report.harvest_potential': 'Harvest Potential',
    'report.structure_recommendation': 'Recommended Structure',
    'report.cost_analysis': 'Cost Analysis',
    'report.annual_harvest': 'Annual Harvest',
    'report.annual_rainfall': 'Annual Rainfall',
    'report.water_quality': 'Water Quality Score',
    'report.total_cost': 'Total Investment',
    'report.annual_savings': 'Annual Savings',
    'report.payback_period': 'Payback Period',
    'report.roi': 'Annual ROI',
    
    // Notifications
    'notification.project_approved': 'Project Approved',
    'notification.project_rejected': 'Project Rejected',
    'notification.contractor_assigned': 'Contractor Assigned',
    'notification.report_ready': 'Report Ready',
    'notification.mark_read': 'Mark as Read',
    'notification.mark_all_read': 'Mark All as Read',
    'notification.no_notifications': 'No notifications',
    
    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    'common.pending': 'Pending',
    'common.completed': 'Completed',
    'common.in_progress': 'In Progress',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Here\'s an overview of your rainwater harvesting journey',
    'dashboard.total_projects': 'Total Projects',
    'dashboard.water_saved': 'Water Saved',
    'dashboard.money_saved': 'Money Saved',
    'dashboard.points_earned': 'Points Earned',
    'dashboard.recent_projects': 'Recent Projects',
    'dashboard.monthly_savings': 'Monthly Water Savings',
    'dashboard.project_status': 'Project Status',
    'dashboard.no_projects': 'No projects yet',
    'dashboard.create_first': 'Start your rainwater harvesting journey today!',
    'dashboard.create_project': 'Create Your First Project',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.manage': 'Manage users, projects, and platform analytics',
    'admin.total_users': 'Total Users',
    'admin.pending_reviews': 'Pending Reviews',
    'admin.monthly_growth': 'Monthly Growth',
    'admin.project_management': 'Project Management',
    'admin.user_management': 'User Management',
    'admin.project_details': 'Project Details'
  },
  hindi: {
    // Navigation
    'nav.home': 'होम',
    'nav.feasibility': 'व्यवहार्यता जांच',
    'nav.projects': 'मेरी परियोजनाएं',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.reports': 'रिपोर्ट',
    'nav.leaderboard': 'लीडरबोर्ड',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.logout': 'लॉगआउट',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.notifications': 'सूचनाएं',
    
    // Home page
    'home.hero.title': 'अपनी छत को जल संरक्षण समाधान में बदलें',
    'home.hero.subtitle': 'अपने घर के लिए तैयार स्मार्ट, टिकाऊ समाधानों के साथ वर्षा जल की शक्ति का उपयोग करें',
    'home.cta.check': 'व्यवहार्यता जांचें',
    'home.cta.learn': 'और जानें',
    'home.stats.water_saved': 'दैनिक बचाए गए लीटर',
    'home.stats.projects': 'पूर्ण परियोजनाएं',
    'home.stats.cities': 'कवर किए गए शहर',
    'home.stats.success': 'सफलता दर',
    
    // Features
    'features.assessment.title': 'स्मार्ट मूल्यांकन',
    'features.assessment.desc': 'आपकी छत के लिए AI-संचालित व्यवहार्यता विश्लेषण',
    'features.structures.title': 'कस्टम संरचनाएं',
    'features.structures.desc': 'अनुकूलित वर्षा जल संचयन प्रणाली डिज़ाइन',
    'features.tracking.title': 'प्रभाव ट्रैकिंग',
    'features.tracking.desc': 'अपनी जल बचत और पर्यावरणीय प्रभाव की निगरानी करें',
    
    // Forms
    'form.project_name': 'परियोजना का नाम',
    'form.roof_area': 'छत का क्षेत्रफल (वर्ग मीटर)',
    'form.location': 'स्थान/शहर',
    'form.dwellers': 'लोगों की संख्या',
    'form.available_space': 'उपलब्ध स्थान (वर्ग मीटर)',
    'form.roof_type': 'छत का प्रकार',
    'form.calculate': 'व्यवहार्यता की गणना करें',
    'form.calculating': 'गणना हो रही है...',
    
    // Reports
    'report.title': 'वर्षा जल संचयन मूल्यांकन रिपोर्ट',
    'report.download': 'PDF रिपोर्ट डाउनलोड करें',
    'report.generating': 'रिपोर्ट तैयार की जा रही है...',
    'report.harvest_potential': 'संचयन क्षमता',
    'report.structure_recommendation': 'अनुशंसित संरचना',
    'report.cost_analysis': 'लागत विश्लेषण',
    'report.annual_harvest': 'वार्षिक संचयन',
    'report.annual_rainfall': 'वार्षिक वर्षा',
    'report.water_quality': 'जल गुणवत्ता स्कोर',
    'report.total_cost': 'कुल निवेश',
    'report.annual_savings': 'वार्षिक बचत',
    'report.payback_period': 'वापसी अवधि',
    'report.roi': 'वार्षिक ROI',
    
    // Common
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.close': 'बंद करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.view': 'देखें',
    'common.approve': 'अनुमोदित करें',
    'common.reject': 'अस्वीकार करें',
    'common.pending': 'लंबित',
    'common.completed': 'पूर्ण',
    'common.in_progress': 'प्रगति में',
    
    // Dashboard
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.overview': 'यहाँ आपकी वर्षा जल संचयन यात्रा का अवलोकन है',
    'dashboard.total_projects': 'कुल परियोजनाएं',
    'dashboard.water_saved': 'बचाया गया पानी',
    'dashboard.money_saved': 'बचाया गया पैसा',
    'dashboard.points_earned': 'अर्जित अंक',
    'dashboard.recent_projects': 'हाल की परियोजनाएं',
    'dashboard.monthly_savings': 'मासिक जल बचत',
    'dashboard.project_status': 'परियोजना स्थिति',
    'dashboard.no_projects': 'अभी तक कोई परियोजना नहीं',
    'dashboard.create_first': 'आज ही अपनी वर्षा जल संचयन यात्रा शुरू करें!',
    'dashboard.create_project': 'अपनी पहली परियोजना बनाएं'
  },
  telugu: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.feasibility': 'సాధ్యత తనిఖీ',
    'nav.projects': 'నా ప్రాజెక్టులు',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.reports': 'రిపోర్టులు',
    'nav.leaderboard': 'లీడర్‌బోర్డ్',
    'nav.login': 'లాగిన్',
    'nav.signup': 'సైన్ అప్',
    'nav.logout': 'లాగౌట్',
    'nav.profile': 'ప్రొఫైల్',
    'nav.notifications': 'నోటిఫికేషన్లు',
    
    // Home page
    'home.hero.title': 'మీ పైకప్పును నీటి సంరక్షణ పరిష్కారంగా మార్చండి',
    'home.hero.subtitle': 'మీ ఇంటికి అనుకూలమైన స్మార్ట్, స్థిరమైన పరిష్కారాలతో వర్షపు నీటి శక్తిని ఉపయోగించండి',
    'home.cta.check': 'సాధ్యత తనిఖీ చేయండి',
    'home.cta.learn': 'మరింత తెలుసుకోండి',
    'home.stats.water_saved': 'రోజువారీ ఆదా చేసిన లీటర్లు',
    'home.stats.projects': 'పూర్తయిన ప్రాజెక్టులు',
    'home.stats.cities': 'కవర్ చేసిన నగరాలు',
    'home.stats.success': 'విజయ రేటు',
    
    // Features
    'features.assessment.title': 'స్మార్ట్ అంచనా',
    'features.assessment.desc': 'మీ పైకప్పు కోసం AI-శక్తితో కూడిన సాధ్యత విశ్లేషణ',
    'features.structures.title': 'కస్టమ్ నిర్మాణాలు',
    'features.structures.desc': 'అనుకూలీకృత వర్షపు నీటి సేకరణ వ్యవస్థ డిజైన్లు',
    'features.tracking.title': 'ప్రభావ ట్రాకింగ్',
    'features.tracking.desc': 'మీ నీటి ఆదా మరియు పర్యావరణ ప్రభావాన్ని పర్యవేక్షించండి',
    
    // Forms
    'form.project_name': 'ప్రాజెక్ట్ పేరు',
    'form.roof_area': 'పైకప్పు వైశాల్యం (చదరపు మీటర్లు)',
    'form.location': 'స్థానం/నగరం',
    'form.dwellers': 'వ్యక్తుల సంఖ్య',
    'form.available_space': 'అందుబాటులో ఉన్న స్థలం (చదరపు మీటర్లు)',
    'form.roof_type': 'పైకప్పు రకం',
    'form.calculate': 'సాధ్యత లెక్కించండి',
    'form.calculating': 'లెక్కిస్తోంది...',
    
    // Reports
    'report.title': 'వర్షపు నీటి సేకరణ అంచనా నివేదిక',
    'report.download': 'PDF నివేదిక డౌన్‌లోడ్ చేయండి',
    'report.generating': 'నివేదిక తయారు చేస్తోంది...',
    'report.harvest_potential': 'సేకరణ సామర్థ్యం',
    'report.structure_recommendation': 'సిఫార్సు చేసిన నిర్మాణం',
    'report.cost_analysis': 'వ్యయ విశ్లేషణ',
    'report.annual_harvest': 'వార్షిక సేకరణ',
    'report.annual_rainfall': 'వార్షిక వర్షపాతం',
    'report.water_quality': 'నీటి నాణ్యత స్కోర్',
    'report.total_cost': 'మొత్తం పెట్టుబడి',
    'report.annual_savings': 'వార్షిక ఆదా',
    'report.payback_period': 'తిరిగి రావడం కాలం',
    'report.roi': 'వార్షిక ROI',
    
    // Common
    'common.submit': 'సమర్పించండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.save': 'సేవ్ చేయండి',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    'common.close': 'మూసివేయండి',
    'common.edit': 'సవరించండి',
    'common.delete': 'తొలగించండి',
    'common.view': 'చూడండి',
    'common.approve': 'ఆమోదించండి',
    'common.reject': 'తిరస్కరించండి',
    'common.pending': 'పెండింగ్',
    'common.completed': 'పూర్తయింది',
    'common.in_progress': 'పురోగతిలో',
    
    // Dashboard
    'dashboard.welcome': 'తిరిగి స్వాగతం',
    'dashboard.overview': 'మీ వర్షపు నీటి సేకరణ ప్రయాణం యొక్క అవలోకనం ఇక్కడ ఉంది',
    'dashboard.total_projects': 'మొత్తం ప్రాజెక్టులు',
    'dashboard.water_saved': 'ఆదా చేసిన నీరు',
    'dashboard.money_saved': 'ఆదా చేసిన డబ్బు',
    'dashboard.points_earned': 'సంపాదించిన పాయింట్లు',
    'dashboard.recent_projects': 'ఇటీవలి ప్రాజెక్టులు',
    'dashboard.monthly_savings': 'నెలవారీ నీటి ఆదా',
    'dashboard.project_status': 'ప్రాజెక్ట్ స్థితి',
    'dashboard.no_projects': 'ఇంకా ప్రాజెక్టులు లేవు',
    'dashboard.create_first': 'ఈరోజే మీ వర్షపు నీటి సేకరణ ప్రయాణాన్ని ప్రారంభించండి!',
    'dashboard.create_project': 'మీ మొదటి ప్రాజెక్ట్‌ను సృష్టించండి'
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
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'english';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
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