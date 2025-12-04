import React from 'react';
import { ChevronRight, Calendar } from 'lucide-react';

interface HeroProps {
  onBookingClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookingClick }) => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-slate-50 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-6 border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
              7 Yıllık Tecrübe ile Yanınızdayım
            </div>
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6 leading-tight">
              Matematiği <span className="text-indigo-600">Anlaşılır</span> ve <span className="text-indigo-600">Kolay</span> Hâle Getiriyoruz
            </h1>
            <p className="mt-4 text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Kırıkkale Fen Lisesi ve Kırıkkale Üniversitesi mezunu olarak, öğrencilerimin sadece sınavlarda değil, öğrenme yolculuklarında da kendilerini güçlü hissetmelerini sağlıyorum.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={onBookingClick}
                className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-xl hover:shadow-2xl cursor-pointer hover:scale-105"
              >
                🎁 Ücretsiz Deneme Dersi Al
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500 text-center lg:text-left">
              ⏱️ 1 saat, ücretsiz, yükümlülük yok • 🔒 Bilgileriniz güvende
            </p>
          </div>

          <div className="mt-12 lg:mt-0 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
              {/* 
                SİSTEM İLK ÖNCE 'seyda.jpg' DOSYASINI ARAR.
                EĞER BULAMAZSA OTOMATİK OLARAK YEDEK GÖRSELE DÖNER.
              */}
              <img
                src="seyda.jpg"
                onError={(e) => {
                  // Fallback: Profesyonel öğretmen görseli
                  e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                  e.currentTarget.onerror = null;
                }}
                alt="Şeyda Açıker"
                className="w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 text-white">
                <p className="font-bold text-xl">Şeyda Açıker</p>
                <p className="text-sm opacity-90">Birebir & Online Eğitim</p>
              </div>
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600 font-bold text-xl">
                  %100
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Memnuniyet</p>
                  <p className="font-bold text-slate-900">Öğrenci Odaklı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;