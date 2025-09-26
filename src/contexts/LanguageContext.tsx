import React, { createContext, useContext, useState } from 'react';

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
    
    // Home page
    'home.hero.title': 'Transform Your Rooftop Into a Water Conservation Solution',
    'home.hero.subtitle': 'Harness the power of rainwater with smart, sustainable solutions tailored for your home',
    'home.cta.check': 'Check Feasibility',
    'home.cta.learn': 'Learn More',
    
    // Features
    'features.assessment.title': 'Smart Assessment',
    'features.assessment.desc': 'AI-powered feasibility analysis for your rooftop',
    'features.structures.title': 'Custom Structures',
    'features.structures.desc': 'Tailored rainwater harvesting system designs',
    'features.tracking.title': 'Impact Tracking',
    'features.tracking.desc': 'Monitor your water savings and environmental impact',
    
    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success'
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
    
    // Home page
    'home.hero.title': 'अपनी छत को जल संरक्षण समाधान में बदलें',
    'home.hero.subtitle': 'अपने घर के लिए तैयार स्मार्ट, टिकाऊ समाधानों के साथ वर्षा जल की शक्ति का उपयोग करें',
    'home.cta.check': 'व्यवहार्यता जांचें',
    'home.cta.learn': 'और जानें',
    
    // Features
    'features.assessment.title': 'स्मार्ट मूल्यांकन',
    'features.assessment.desc': 'आपकी छत के लिए AI-संचालित व्यवहार्यता विश्लेषण',
    'features.structures.title': 'कस्टम संरचनाएं',
    'features.structures.desc': 'अनुकूलित वर्षा जल संचयन प्रणाली डिज़ाइन',
    'features.tracking.title': 'प्रभाव ट्रैकिंग',
    'features.tracking.desc': 'अपनी जल बचत और पर्यावरणीय प्रभाव की निगरानी करें',
    
    // Common
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता'
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
    
    // Home page
    'home.hero.title': 'మీ పైకప్పును నీటి సంరక్షణ పరిష్కారంగా మార్చండి',
    'home.hero.subtitle': 'మీ ఇంటికి అనుకూలమైన స్మార్ట్, స్థిరమైన పరిష్కారాలతో వర్షపు నీటి శక్తిని ఉపయోగించండి',
    'home.cta.check': 'సాధ్యత తనిఖీ చేయండి',
    'home.cta.learn': 'మరింత తెలుసుకోండి',
    
    // Features
    'features.assessment.title': 'స్మార్ట్ అంచనా',
    'features.assessment.desc': 'మీ పైకప్పు కోసం AI-శక్తితో కూడిన సాధ్యత విశ్లేషణ',
    'features.structures.title': 'కస్టమ్ నిర్మాణాలు',
    'features.structures.desc': 'అనుకూలీకృత వర్షపు నీటి సేకరణ వ్యవస్థ డిజైన్లు',
    'features.tracking.title': 'ప్రభావ ట్రాకింగ్',
    'features.tracking.desc': 'మీ నీటి ఆదా మరియు పర్యావరణ ప్రభావాన్ని పర్యవేక్షించండి',
    
    // Common
    'common.submit': 'సమర్పించండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.save': 'సేవ్ చేయండి',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం'
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
  const [language, setLanguage] = useState<Language>('english');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};