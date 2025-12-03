import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { SERVICES } from '../constants';

interface ServicesProps {
  onBookingClick?: () => void;
}

const Services: React.FC<ServicesProps> = ({ onBookingClick }) => {
  const serviceCTAs = [
    { text: "📅 Birebir Ders Rezervasyonu Yap", subtext: "Esnek saatler, online veya yüz yüze" },
    { text: "🎯 LGS Paketini İncele", subtext: "Deneme sınavları dahil" },
    { text: "💻 Online Ders Nasıl Çalışır?", subtext: "Teknik destek sağlanır" },
    { text: "📚 Özel Program Hakkında Bilgi Al", subtext: "Kişiselleştirilmiş çalışma planı" }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Hizmetler</h2>
          <p className="mt-2 text-4xl font-serif font-bold text-[#1C2A5E]">
            Size Nasıl Yardımcı Olabilirim?
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
            Öğrencinin ihtiyacına göre şekillenen, başarı odaklı programlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 border-slate-100 hover:border-indigo-200 flex flex-col"
              >
                <div className="flex gap-6 items-start mb-6">
                  <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm">
                          <Icon className="h-8 w-8 text-indigo-600" />
                      </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                
                {/* NEW: Service CTA */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button
                    onClick={onBookingClick}
                    className="w-full group flex items-center justify-between px-6 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold">{serviceCTAs[index]?.text}</div>
                      <div className="text-xs opacity-75 mt-0.5">{serviceCTAs[index]?.subtext}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;