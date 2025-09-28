import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Menu, X, Globe, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowUserMenu(false);
  };

  const getNavLinks = () => {
    const baseLinks = [
      { to: '/', label: t('nav.home') },
      { to: '/quick-check', label: t('nav.quick_check') }
    ];

    if (!user) {
      return baseLinks;
    }

    const userLinks = [
      { to: '/projects', label: t('nav.projects') },
      { to: '/profile', label: t('nav.profile') }
    ];

    if (user.role === 'contractor') {
      userLinks.push({ to: '/contractor', label: t('nav.contractor') });
    }

    if (user.role === 'admin') {
      userLinks.push({ to: '/admin', label: t('nav.admin') });
    }

    return [...baseLinks, ...userLinks];
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-green-600" />
              <span className="font-bold text-xl text-green-700">RainShare</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'english' ? 'EN' : language === 'hindi' ? 'हि' : 'తె'}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50">
                  {(['english', 'hindi', 'telugu'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        language === lang ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang === 'english' ? 'English' : lang === 'hindi' ? 'हिंदी' : 'తెలుగు'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-green-700"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  {t('nav.logout')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;