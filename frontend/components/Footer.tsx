import React from 'react';

const Footer: React.FC = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1C2A5E] text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="flex flex-col items-center md:items-start gap-3">
          <span className="text-xl font-serif font-bold text-white tracking-wider">ŞEYDA AÇIKER</span>
          <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Özel Matematik Öğretmeni</span>
        </div>

        <div className="flex space-x-8 text-sm font-medium">
          <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer">Hakkımda</a>
          <a href="#services" onClick={(e) => handleScroll(e, 'services')} className="text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer">Hizmetler</a>
          <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className="text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer">İletişim</a>
          <a href="/privacy-policy" className="text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer">Gizlilik Politikası</a>
        </div>

        <div className="text-sm text-slate-400 text-center md:text-right">
          <p>&copy; {new Date().getFullYear()} Şeyda Açıker.</p>
          <p className="mt-1">Tüm Hakları Saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;