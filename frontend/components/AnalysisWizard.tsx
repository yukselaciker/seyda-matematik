/**
 * AnalysisWizard.tsx - Pedagogical Competence Inventory
 * FIXED: Weighted Scoring System with proper category differentiation
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Brain, Heart, Target, MessageCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

interface QuestionOption {
    text: string;
    categoryScores: {
        anxiety: number;
        foundation: number;
        focus: number;
        discipline: number;
    };
}

interface Question {
    id: string;
    domain: string;
    question: string;
    subtitle: string;
    options: QuestionOption[];
}

interface CategoryScores {
    anxiety: number;
    foundation: number;
    focus: number;
    discipline: number;
}

interface DiagnosisResult {
    title: string;
    category: 'anxiety' | 'foundation' | 'focus' | 'discipline';
    description: string;
    recommendations: string[];
    duration: string;
    priority: 'high' | 'medium' | 'low';
    color: string;
    icon: React.ReactNode;
}

const questions: Question[] = [
    {
        id: 'affective',
        domain: 'Duyuşsal Alan - Kaygı Değerlendirmesi',
        question: 'Matematik sınavı yaklaştığında öğrencinizin ruh hali nasıl değişiyor?',
        subtitle: 'Bu soru matematik kaygısı seviyesini ölçer',
        options: [
            {
                text: 'Çok gergin oluyor, fiziksel belirtiler (karın ağrısı, baş ağrısı, uyku sorunu) yaşıyor',
                categoryScores: { anxiety: 10, foundation: 0, focus: 0, discipline: 0 }
            },
            {
                text: 'Biraz endişeli ama yönetebiliyor, sınavdan önce hafif stres hissediyor',
                categoryScores: { anxiety: 5, foundation: 0, focus: 0, discipline: 0 }
            },
            {
                text: 'Gayet rahat, kendine güveniyor ve sınava hazır hissediyor',
                categoryScores: { anxiety: 0, foundation: 3, focus: 2, discipline: 0 }
            }
        ]
    },
    {
        id: 'cognitive',
        domain: 'Bilişsel Alan - Kavramsal Temel',
        question: 'Yeni nesil (uzun metinli) matematik sorularıyla karşılaştığında tepkisi ne oluyor?',
        subtitle: 'Bu soru kavramsal anlama ve öz-yeterlilik düzeyini ölçer',
        options: [
            {
                text: 'Soruyu okumadan "Ben bunu yapamam" deyip geçiyor, öğrenilmiş çaresizlik gösteriyor',
                categoryScores: { anxiety: 8, foundation: 0, focus: 0, discipline: 0 }
            },
            {
                text: 'Dört işlem yapabiliyor ama sorunun mantığını kuramıyor, ne istendiğini anlamıyor',
                categoryScores: { anxiety: 0, foundation: 10, focus: 0, discipline: 0 }
            },
            {
                text: 'Sorunun mantığını kuruyor ama işlem hatası veya dikkatsizlik yapıyor',
                categoryScores: { anxiety: 0, foundation: 2, focus: 8, discipline: 0 }
            },
            {
                text: 'Soruyu anlıyor, mantığı kuruyor ve doğru çözüme ulaşabiliyor',
                categoryScores: { anxiety: 0, foundation: 0, focus: 0, discipline: 5 }
            }
        ]
    },
    {
        id: 'metacognition',
        domain: 'Üst Biliş - Hata Analizi',
        question: 'Deneme sınavlarındaki yanlışlarının temel sebebi genelde nedir?',
        subtitle: 'Bu soru öğrenme stratejileri ve hata kaynaklarını tespit eder',
        options: [
            {
                text: 'Konuyu hiç bilmiyor / hatırlamıyor, öğrenme eksikliği açıkça görülüyor',
                categoryScores: { anxiety: 0, foundation: 10, focus: 0, discipline: 0 }
            },
            {
                text: 'Soruyu yanlış okuyor, eksik okuyor veya dikkat hatası yapıyor',
                categoryScores: { anxiety: 0, foundation: 0, focus: 10, discipline: 0 }
            },
            {
                text: 'Konuyu biliyor ama süreyi yetiştiremiyor, pratik eksikliği var',
                categoryScores: { anxiety: 0, foundation: 3, focus: 5, discipline: 0 }
            },
            {
                text: 'Sınav ortamında panik yaşıyor, evde yapabildiği soruları sınavda yapamıyor',
                categoryScores: { anxiety: 10, foundation: 0, focus: 0, discipline: 0 }
            }
        ]
    },
    {
        id: 'self_regulation',
        domain: 'Öz-Düzenleme - Çalışma Rutini',
        question: 'Evdeki matematik çalışma rutini nasıl?',
        subtitle: 'Bu soru öz-disiplin ve çalışma alışkanlıklarını değerlendirir',
        options: [
            {
                text: 'Sadece sınavdan sınava çalışıyor, düzenli bir rutini yok',
                categoryScores: { anxiety: 0, foundation: 0, focus: 0, discipline: 10 }
            },
            {
                text: 'Masa başına oturuyor ama çabuk sıkılıyor, dikkatini toparlayamıyor',
                categoryScores: { anxiety: 0, foundation: 0, focus: 7, discipline: 3 }
            },
            {
                text: 'Düzenli çalışmaya çalışıyor ama verimlilik düşük, neyi nasıl çalışacağını bilmiyor',
                categoryScores: { anxiety: 0, foundation: 5, focus: 0, discipline: 5 }
            },
            {
                text: 'Planlı ve düzenli çalışıyor, öğrendiği teknikleri uygulayabiliyor',
                categoryScores: { anxiety: 0, foundation: 0, focus: 0, discipline: 0 }
            }
        ]
    }
];

const calculateDiagnosis = (totalScores: CategoryScores): DiagnosisResult => {
    // Debug logging
    console.log('Final Scores:', totalScores);

    // Find the category with highest score
    const scoresArray = [
        { category: 'foundation' as const, score: totalScores.foundation },
        { category: 'anxiety' as const, score: totalScores.anxiety },
        { category: 'focus' as const, score: totalScores.focus },
        { category: 'discipline' as const, score: totalScores.discipline }
    ];

    // Sort by score descending, with foundation as tie-breaker priority
    scoresArray.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tie-breaker: foundation > anxiety > focus > discipline
        const priority = { foundation: 4, anxiety: 3, focus: 2, discipline: 1 };
        return priority[b.category] - priority[a.category];
    });

    const winner = scoresArray[0];
    console.log('Winner Category:', winner.category, 'Score:', winner.score);

    // Return diagnosis based on winner
    if (winner.category === 'foundation') {
        return {
            title: '📚 Kavramsal Temel Eksikliği (Sarmal Yapı Sorunu)',
            category: 'foundation',
            description: 'Matematiğin temellerinde boşluklar tespit edildi. Mevcut sınıf konularına geçmeden önce acil "Temel Tamamlama Kampı" yapılmalı. Sarmal yapıdaki eksiklikler üst konularda kalıcı öğrenmeyi engelliyor.',
            recommendations: [
                'Geriye dönük kavram takviyesi (sarmal yapı yaklaşımı)',
                'Somut materyallerle kavramsal öğrenme',
                'Adım adım, sabırlı ve sistematik ilerleyiş',
                'Her yeni konu öncesi ön koşul kontrolü'
            ],
            duration: '10-14 Haftalık Yoğun Temel İnşa Programı',
            priority: 'high',
            color: 'from-amber-500 to-orange-600',
            icon: <Target className="w-10 h-10 text-white" />
        };
    }

    if (winner.category === 'anxiety') {
        return {
            title: '🧠 Matematik Kaygısı ve Özgüven Blokajı',
            category: 'anxiety',
            description: 'Öğrenci yapabileceğine inanmadığı için potansiyelini yansıtamıyor. "Öğrenilmiş Çaresizlik" sendromu ve yüksek sınav kaygısı performansı baskılıyor. Öncelik: Motivasyon ve kolaydan zora başarı deneyimleri.',
            recommendations: [
                'Özgüven inşası ve kaygı yönetimi teknikleri',
                'Başarı deneyimleri ile pozitif pekiştirme',
                'Küçük hedeflerle kademeli ilerleme',
                'Sınav simülasyonları ile desensitizasyon'
            ],
            duration: '8-12 Haftalık Psikolojik Destek Odaklı Program',
            priority: 'high',
            color: 'from-rose-500 to-pink-600',
            icon: <Heart className="w-10 h-10 text-white" />
        };
    }

    if (winner.category === 'focus') {
        return {
            title: '🎯 Dikkat Yönetimi ve İşlem Hatası Sorunu',
            category: 'focus',
            description: 'Konuyu biliyor ama basit hatalar yapıyor. "Seçici Dikkat" kapasitesi zayıf, dikkatsizlik ve süre yönetimi problemleri var. Potansiyelin altında performans gösteriyor.',
            recommendations: [
                'Dikkat ve konsantrasyon egzersizleri',
                'Yeni nesil soru pratiği ile stratejik okuma',
                'Süre yönetimi ve hız çalışmaları',
                'Sistematik hata analizi alışkanlığı'
            ],
            duration: '6-8 Haftalık Odak Geliştirme Programı',
            priority: 'medium',
            color: 'from-blue-500 to-indigo-600',
            icon: <Brain className="w-10 h-10 text-white" />
        };
    }

    // discipline wins or low scores everywhere
    return {
        title: '⚡ Çalışma Disiplini ve Motivasyon İhtiyacı',
        category: 'discipline',
        description: 'Düzenli çalışma rutini eksik. Potansiyel var ama sistematik takip ve öğrenci koçluğu gerekiyor. Profesyonel rehberlik ile çalışma alışkanlıkları kazandırılmalı.',
        recommendations: [
            'Kişiselleştirilmiş çalışma planı oluşturma',
            'Haftalık hedef belirleme ve takip sistemi',
            'Motivasyon artırıcı mini ödüller',
            'Düzenli öğretmen-veli iletişimi'
        ],
        duration: '8-10 Haftalık Öğrenci Koçluğu Programı',
        priority: 'medium',
        color: 'from-purple-500 to-violet-600',
        icon: <Zap className="w-10 h-10 text-white" />
    };
};

const AnalysisWizard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<QuestionOption[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [totalScores, setTotalScores] = useState<CategoryScores>({
        anxiety: 0,
        foundation: 0,
        focus: 0,
        discipline: 0
    });

    if (!isOpen) return null;

    const handleAnswer = (option: QuestionOption) => {
        const newOptions = [...selectedOptions, option];
        setSelectedOptions(newOptions);

        // Update total scores
        const newScores = { ...totalScores };
        newScores.anxiety += option.categoryScores.anxiety;
        newScores.foundation += option.categoryScores.foundation;
        newScores.focus += option.categoryScores.focus;
        newScores.discipline += option.categoryScores.discipline;
        setTotalScores(newScores);

        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                setShowResult(true);
            }
        }, 150);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            const removedOption = selectedOptions[selectedOptions.length - 1];

            // Revert scores
            const newScores = { ...totalScores };
            newScores.anxiety -= removedOption.categoryScores.anxiety;
            newScores.foundation -= removedOption.categoryScores.foundation;
            newScores.focus -= removedOption.categoryScores.focus;
            newScores.discipline -= removedOption.categoryScores.discipline;
            setTotalScores(newScores);

            setCurrentStep(currentStep - 1);
            setSelectedOptions(selectedOptions.slice(0, -1));
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setSelectedOptions([]);
        setShowResult(false);
        setTotalScores({ anxiety: 0, foundation: 0, focus: 0, discipline: 0 });
    };

    const result = showResult ? calculateDiagnosis(totalScores) : null;
    const progress = ((currentStep + 1) / questions.length) * 100;

    // Generate WhatsApp message
    const generateWhatsAppMessage = () => {
        if (!result) return '';
        return `Merhaba Şeyda Hocam, sitedeki Pedagojik Analiz Envanteri'ni tamamladık.

📋 Tanı Sonucu: ${result.title}

${result.description}

Profesyonel destek programı oluşturmak ve detaylı görüşmek istiyoruz.`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                {!showResult ? (
                    <>
                        {/* Progress Bar */}
                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-800">Pedagojik Yeterlik Envanteri</h3>
                                <span className="text-sm font-semibold text-indigo-600">
                                    {currentStep + 1} / {questions.length}
                                </span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-8">
                            <div key={currentStep} className="animate-slideInRight">
                                {/* Domain Badge */}
                                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
                                    <Brain className="w-4 h-4" />
                                    {questions[currentStep].domain}
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                                    {questions[currentStep].question}
                                </h2>

                                <p className="text-sm text-slate-500 mb-6 italic">
                                    {questions[currentStep].subtitle}
                                </p>

                                <div className="space-y-3">
                                    {questions[currentStep].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            className="w-full text-left px-6 py-4 bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl transition-all text-slate-700 hover:text-indigo-700 group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="flex-1">{option.text}</span>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 mt-0.5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Back Button */}
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="mt-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Önceki Soru
                                </button>
                            )}
                        </div>
                    </>
                ) : result && (
                    <div className="p-8">
                        {/* Result Icon */}
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${result.color} mb-6 animate-bounce`}>
                            {result.icon}
                        </div>

                        {/* Diagnosis Title */}
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            {result.title}
                        </h2>

                        {/* Priority Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-bold ${result.priority === 'high' ? 'bg-red-100 text-red-700' :
                                result.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'
                            }`}>
                            {result.priority === 'high' ? '🔴 Yüksek Öncelik' :
                                result.priority === 'medium' ? '🟡 Orta Öncelik' :
                                    '🟢 Rutin Takip'}
                        </div>

                        {/* Description */}
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-slate-200">
                            <p className="text-lg text-slate-700 leading-relaxed mb-6">
                                {result.description}
                            </p>

                            {/* Recommendations */}
                            <div className="space-y-3 mb-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    Önerilen Müdahale Stratejisi:
                                </h4>
                                <ul className="space-y-2">
                                    {result.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                                            <span className="text-indigo-600 mt-1">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-200">
                                <span className="text-sm font-semibold text-indigo-700">{result.duration}</span>
                            </div>
                        </div>

                        {/* Category Scores Display */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
                                <p className="text-xs text-rose-600 mb-1">Kaygı</p>
                                <p className="text-xl font-bold text-rose-700">{totalScores.anxiety}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                <p className="text-xs text-amber-600 mb-1">Temel</p>
                                <p className="text-xl font-bold text-amber-700">{totalScores.foundation}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                                <p className="text-xs text-blue-600 mb-1">Odak</p>
                                <p className="text-xl font-bold text-blue-700">{totalScores.focus}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                                <p className="text-xs text-purple-600 mb-1">Disiplin</p>
                                <p className="text-xl font-bold text-purple-700">{totalScores.discipline}</p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/905337652071?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Pedagojik Analiz Sonucunu Şeyda Hocaya Gönder
                            </a>

                            <button
                                onClick={handleReset}
                                className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                            >
                                🔄 Yeni Analiz Yap
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default AnalysisWizard;
