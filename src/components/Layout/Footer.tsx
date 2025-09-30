import React from 'react';
import { Droplets, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-green-900 text-white relative overflow-hidden">
      {/* Water droplet pattern in footer */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-1/4 w-8 h-12 bg-white water-droplet"></div>
        <div className="absolute top-12 right-1/3 w-6 h-10 bg-white water-droplet"></div>
        <div className="absolute bottom-8 left-1/2 w-10 h-14 bg-white water-droplet"></div>
        <div className="absolute bottom-4 right-1/4 w-4 h-8 bg-white water-droplet"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-10 bg-blue-400 water-droplet flex items-center justify-center">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">AquaHarvest</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transforming rooftops into sustainable water conservation solutions for a better tomorrow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/feasibility" className="text-gray-400 hover:text-white transition-colors text-sm">Feasibility Check</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Rainwater Assessment</li>
              <li className="text-gray-400">Structure Design</li>
              <li className="text-gray-400">Cost Analysis</li>
              <li className="text-gray-400">Project Management</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">info@aquaharvest.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Hyderabad, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AquaHarvest. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;