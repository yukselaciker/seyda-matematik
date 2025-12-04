/**
 * Pricing.tsx - Pricing Packages Section
 * 
 * Critical for conversion:
 * - Price transparency increases conversion by 25-30%
 * - Prevents tire-kickers
 * - Package options increase average transaction value by 40%
 */

import React, { memo } from 'react';
import { Check, Star, Zap, Trophy, ArrowRight } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  pricePerLesson: string;
  lessons: number;
  frequency: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Deneme Paketi",
    price: "₺1,200",
    pricePerLesson: "₺300/ders",
    lessons: 4,
    frequency: "Haftada 1",
    description: "Matematiğe ısınmak isteyenler için",
    icon: <Star className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: [
      "4 Birebir Ders (60 dakika)",
      "Ödev takibi",
      "WhatsApp desteği",
      "Kişisel çalışma planı",
      "İlk ders ücretsiz deneme"
    ]
  },
  {
    name: "Standart Paket",
    price: "₺2,200",
    pricePerLesson: "₺275/ders",
    lessons: 8,
    frequency: "Haftada 2",
    description: "Düzenli ilerleme isteyenler için",
    icon: <Zap className="w-6 h-6" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    popular: true,
    features: [
      "8 Birebir Ders (60 dakika)",
      "Tüm özellikler + Konu testleri",
      "Haftalık veli bilgilendirme raporu",
      "Deneme sınavları",
      "Öncelikli WhatsApp desteği",
      "İlk ders ücretsiz deneme"
    ]
  },
  {
    name: "Yoğun LGS Hazırlık",
    price: "₺3,000",
    pricePerLesson: "₺250/ders",
    lessons: 12,
    frequency: "Haftada 3",
    description: "LGS'ye ciddi hazırlananlar için",
    icon: <Trophy className="w-6 h-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    features: [
      "12 Birebir Ders (60 dakika)",
      "Tüm özellikler + LGS deneme sınavları",
      "Haftalık performans analizi",
      "Soru bankası erişimi",
      "7/24 WhatsApp desteği",
      "Öncelikli randevu hakkı",
      "İlk ders ücretsiz deneme"
    ]
  }
];

const Pricing: React.FC = memo(() => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#1C2A5E] mb-4">
            Ders Paketleri ve Ücretler
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Size en uygun paketi seçin – <span className="font-semibold text-indigo-600">ilk ders ücretsiz!</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 ${tier.borderColor} p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${tier.popular ? 'ring-4 ring-indigo-100 shadow-xl' : 'shadow-lg'
                }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-full shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    EN POPÜLER
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 ${tier.bgColor} rounded-2xl mb-4 ${tier.color}`}>
                {tier.icon}
              </div>

              {/* Package Name */}
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {tier.name}
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-6">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-[#1C2A5E]">
                    {tier.price}
                  </span>
                  <span className="text-slate-500">
                    / ay
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {tier.pricePerLesson} • {tier.lessons} ders • {tier.frequency}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 ${tier.bgColor} rounded-full flex items-center justify-center mt-0.5`}>
                      <Check className={`w-3 h-3 ${tier.color}`} />
                    </div>
                    <span className="text-slate-700 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${tier.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                    : `${tier.bgColor} ${tier.color} hover:shadow-lg`
                  }`}
              >
                Paketi Seç
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                ✅
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                İlk Ders Ücretsiz
              </h4>
              <p className="text-sm text-slate-600">
                Tüm paketlerde 1 saat deneme dersi
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                🔄
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                Esnek Ödeme
              </h4>
              <p className="text-sm text-slate-600">
                Havale/EFT veya nakit ödeme
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                💯
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">
                Memnuniyet Garantisi
              </h4>
              <p className="text-sm text-slate-600">
                İlk 2 dersten sonra iade hakkı
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Hangi paketin size uygun olduğundan emin değil misiniz?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-4 bg-white text-[#1C2A5E] border-2 border-[#1C2A5E] rounded-xl font-semibold hover:bg-[#1C2A5E] hover:text-white transition-all duration-300"
          >
            📞 Ücretsiz Danışmanlık Alın
          </a>
        </div>
      </div>
    </section>
  );
});

Pricing.displayName = 'Pricing';

export default Pricing;
