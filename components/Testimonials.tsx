import React from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section - NEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-indigo-100">
            <div className="text-4xl font-bold text-indigo-600 mb-2">150+</div>
            <p className="text-sm text-slate-600">Mutlu Öğrenci</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-100">
            <div className="text-4xl font-bold text-green-600 mb-2">+35</div>
            <p className="text-sm text-slate-600">Ortalama Not Artışı</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-amber-100">
            <div className="text-4xl font-bold text-amber-600 mb-2">%92</div>
            <p className="text-sm text-slate-600">LGS Başarı Oranı</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-blue-100">
            <div className="text-4xl font-bold text-blue-600 mb-2">2 saat</div>
            <p className="text-sm text-slate-600">Ortalama Yanıt Süresi</p>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Başarı Hikayeleri</h2>
          <p className="mt-2 text-4xl font-serif font-bold text-[#1C2A5E]">
            Gurur Tablomuz & Veli Görüşleri
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
            Öğrencilerimin başarıları ve velilerimizin değerli geri bildirimleri, en büyük motivasyon kaynağım.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-100" />
              
              <div className="mb-6">
                <div className="flex space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <blockquote className="flex-1 mb-6">
                <p className="text-slate-600 italic leading-relaxed text-lg">
                  "{item.message}"
                </p>
              </blockquote>

              {/* Grades highlight */}
              {item.grades && item.grades.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {item.grades.map((grade, gIndex) => (
                    <span 
                        key={gIndex} 
                        className={`text-xs font-bold px-3 py-1 rounded-full ${grade.includes('100') || grade.includes('9') ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {index === 0 ? 'Kasım 2024' : index === 1 ? 'Ekim 2024' : 'Aralık 2024'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;