/**
 * CommonMistakes.tsx - Common Student Mistakes Section
 * 
 * High impact for conversion:
 * - Creates "aha moments" for parents
 * - Builds emotional connection through empathy
 * - Positions teacher as expert
 * - Creates urgency
 */

import React, { memo } from 'react';
import { X, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface Mistake {
  title: string;
  problem: string;
  consequence: string;
  solution: string;
  icon: string;
}

const mistakes: Mistake[] = [
  {
    title: "Ezber Yapmak, Anlamadan Geçmek",
    problem: "Formülleri ezberler ama neden kullanıldığını bilmez",
    consequence: "Soru tipi değişince çözemiyor, sınavda şok yaşıyor",
    solution: "Her konuyu günlük hayattan örneklerle öğretiyorum. Formül değil, mantık öğreniyoruz.",
    icon: "📚"
  },
  {
    title: "Temel Konuları Atlamak",
    problem: "5-6. sınıf kesirler eksikse, 8. sınıf denklemler çözülemiyor",
    consequence: "Her yeni konu daha da zorlaşıyor, motivasyon düşüyor",
    solution: "İlk derste eksik konuları tespit edip sistematik şekilde dolduruyorum.",
    icon: "🧱"
  },
  {
    title: "Sadece Kolay Sorular Çözmek",
    problem: "Zor sorulardan kaçınca kendini hazır sanıyor",
    consequence: "Sınavda zorlu sorularla karşılaşınca panik yapıyor",
    solution: "Zorluk seviyesini kademeli artırarak özgüven ve beceri geliştiriyorum.",
    icon: "🎯"
  },
  {
    title: "Hataları Analiz Etmemek",
    problem: "Yanlış soruyu bir daha çözüp öğrenmiyor",
    consequence: "Aynı hataları tekrar tekrar yapıyor, ilerleme yok",
    solution: "Her yanlışı birlikte inceleyip 'yanlış defteri' tutuyoruz. 3 kez tekrar ediyoruz.",
    icon: "🔍"
  },
  {
    title: "Düzensiz Çalışmak",
    problem: "Sınav öncesi panik çalışma, günlük düzen yok",
    consequence: "Bilgiler kalıcı olmuyor, stres seviyesi yüksek",
    solution: "Her öğrenciye özel haftalık çalışma takvimi oluşturuyorum. Düzenli = Başarı.",
    icon: "📅"
  }
];

const CommonMistakes: React.FC = memo(() => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-[#1C2A5E] mb-4">
            Öğrencilerin En Sık Yaptığı 5 Matematik Hatası
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Bu hataları erken fark etmek, başarıyı <span className="font-bold text-amber-600">2 kat artırıyor</span>
          </p>
        </div>

        {/* Mistakes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {mistakes.map((mistake, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-slate-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl flex-shrink-0">
                  {mistake.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    ❌ {mistake.title}
                  </h3>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-4 pl-16">
                <div className="flex items-start gap-2 mb-2">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-600 mb-1">
                      Sorun:
                    </p>
                    <p className="text-slate-700">
                      {mistake.problem}
                    </p>
                  </div>
                </div>

                {/* Consequence */}
                <div className="flex items-start gap-2 mb-4 mt-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-600 mb-1">
                      Sonuç:
                    </p>
                    <p className="text-slate-700">
                      {mistake.consequence}
                    </p>
                  </div>
                </div>

                {/* Solution */}
                <div className="flex items-start gap-2 bg-green-50 p-4 rounded-xl border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      ✅ Çözüm:
                    </p>
                    <p className="text-slate-700">
                      {mistake.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Success Story Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8 flex flex-col justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Bu Hataları Düzelten Öğrencilerim
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    +35
                  </div>
                  <p className="text-sm text-slate-600">
                    Ortalama Not Artışı
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    %92
                  </div>
                  <p className="text-sm text-slate-600">
                    LGS Başarı Oranı
                  </p>
                </div>
              </div>
              <p className="text-slate-700 italic mb-6">
                "Efe matematikte 45 alıyordu, artık 85-90 arası alıyor!"
                <br />
                <span className="text-sm text-slate-500">- Ayşe Yılmaz, Efe'nin Annesi</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#1C2A5E] to-indigo-700 rounded-2xl p-10 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Çocuğunuzun Bu Hatalardan Kaçınmasını Sağlayın!
          </h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Ücretsiz deneme dersinde öğrencinizin hangi hataları yaptığını tespit edelim ve kişisel çözüm planı oluşturalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#1C2A5E] rounded-xl font-bold hover:bg-slate-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              🎁 Ücretsiz Deneme Dersi Al
            </a>
            <a
              href="https://wa.me/905337652071"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              💬 WhatsApp'tan Hemen Yaz
            </a>
          </div>
          <p className="text-sm text-indigo-200 mt-4">
            ⏱️ Ortalama yanıt süresi: 2 saat • 🔒 Bilgileriniz güvende
          </p>
        </div>
      </div>
    </section>
  );
});

CommonMistakes.displayName = 'CommonMistakes';

export default CommonMistakes;
