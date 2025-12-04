import React, { useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';

interface NavbarProps {
  onBookingClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookingClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (href.startsWith('#')) {
      const elementId = href.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        const navbarHeight = 96; // h-24 = 96px
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="h-20 w-auto transition-transform duration-300 group-hover:scale-105">
              <Logo className="h-full w-auto" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-slate-600 hover:text-indigo-900 px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}

            <button
              onClick={onBookingClick}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-md text-white bg-[#1C2A5E] hover:bg-indigo-900 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 mr-2 text-[#D4AF37]" />
              Demo Ders Al
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}

            <button
              onClick={() => { onBookingClick(); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 text-white bg-[#1C2A5E] rounded-lg font-medium hover:bg-indigo-900 transition-colors"
            >
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              Demo Ders Al
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
