/**
 * Roadmap.tsx - Success Roadmap Timeline Component
 * Premium vertical timeline showing the student journey
 */

import React from 'react';
import { Phone, ClipboardList, BookOpen, BarChart3, Trophy, CheckCircle } from 'lucide-react';

interface RoadmapStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    highlight?: string;
}

const steps: RoadmapStep[] = [
    {
        icon: <Phone className="w-6 h-6" />,
        title: "Ücretsiz Ön Görüşme & Analiz",
        description: "WhatsApp veya telefon ile tanışma. Öğrencinin seviyesi ve hedefleri belirlenir.",
        highlight: "🎁 ÜCRETSİZ"
    },
    {
        icon: <ClipboardList className="w-6 h-6" />,
        title: "Kişiye Özel Ders Programı",
        description: "Eksik konular tespit edilir, öğrenciye özel haftalık program oluşturulur.",
    },
    {
        icon: <BookOpen className="w-6 h-6" />,
        title: "Konu Hakimiyeti & Yeni Nesil Sorular",
        description: "Temel konular pekiştirilir, LGS tarzı soru çözme teknikleri öğretilir.",
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Düzenli Deneme & Geri Bildirim",
        description: "Haftalık mini denemeler, performans takibi ve veli bilgilendirme.",
    },
    {
        icon: <Trophy className="w-6 h-6" />,
        title: "Zirve & Başarı",
        description: "Hedeflenen başarıya ulaşma, özgüvenli ve donanımlı bir öğrenci!",
        highlight: "🏆 HEDEF"
    }
];

const Roadmap: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-indigo-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                        Başarı Yol Haritası
                    </h2>
                    <p className="mt-2 text-4xl font-serif font-bold text-[#1C2A5E]">
                        5 Adımda Matematik Başarısı
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
                        Her öğrencimle bu yolculuğu birlikte tamamlıyoruz
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-400 to-green-400 hidden sm:block"></div>

                    {/* Steps */}
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative flex items-start gap-6 group"
                            >
                                {/* Step Number & Icon */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${index === steps.length - 1
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                            : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                        }`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 shadow-md border-2 border-indigo-100">
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 group-hover:border-indigo-200">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-600">
                                                {step.description}
                                            </p>
                                        </div>
                                        {step.highlight && (
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${index === steps.length - 1
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {step.highlight}
                                            </span>
                                        )}
                                    </div>

                                    {index === steps.length - 1 && (
                                        <div className="mt-4 flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-sm font-semibold">Ortalama 3-4 ayda hedefe ulaşılır</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-xl hover:shadow-2xl"
                    >
                        🚀 Bu Yolculuğa Başla
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Roadmap;
