/**
 * AnalysisWizard.tsx - Professional Math Success Analysis Wizard
 * Modal-based diagnostic tool with smart recommendations
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Target, TrendingUp, MessageCircle, CheckCircle } from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: { value: string; label: string }[];
}

interface Answer {
    questionId: string;
    value: string;
    label: string;
}

const questions: Question[] = [
    {
        id: 'grade',
        question: 'Çocuğunuz kaçıncı sınıfa gidiyor?',
        options: [
            { value: '4-5', label: '4-5. Sınıf' },
            { value: '6-7', label: '6-7. Sınıf' },
            { value: '8-lgs', label: '8. Sınıf (LGS Hazırlık)' },
            { value: '9-12', label: '9-10. Sınıf' }
        ]
    },
    {
        id: 'performance',
        question: 'Matematik dersi not ortalaması veya deneme netleri nasıl?',
        options: [
            { value: 'low', label: '0-40 Net / 0-50 Not (Düşük)' },
            { value: 'medium', label: '40-70 Net / 50-70 Not (Orta)' },
            { value: 'high', label: '70-100 Net / 70-85 Not (İyi)' },
            { value: 'excellent', label: '85-100 Net / 85+ Not (Mükemmel)' }
        ]
    },
    {
        id: 'difficulty',
        question: 'En çok nerede zorlanıyor?',
        options: [
            { value: 'basics', label: '🧮 Temel Kavram Eksikliği (Çarpım tablosu, kesir, oran vb.)' },
            { value: 'operations', label: '⚠️ İşlem Hatası (Bildiği konularda dikkatsizlik)' },
            { value: 'new-gen', label: '🧩 Yeni Nesil Sorular (Okuduğunu anlamama)' },
            { value: 'time', label: '⏱️ Süre Yetiştirme (Yavaş çözüyor)' }
        ]
    },
    {
        id: 'goal',
        question: 'Hedefiniz nedir?',
        options: [
            { value: 'pass', label: '📚 Sınıfı Başarıyla Geçsin' },
            { value: 'good-school', label: '🎓 İyi Bir Lise Kazansın' },
            { value: 'top-school', label: '🏆 Fen Lisesi / Derece Yapsın' },
            { value: 'confidence', label: '💪 Özgüven Kazansın ve Matematik Sevsin' }
        ]
    }
];

const getAnalysisResult = (answers: Answer[]) => {
    const difficulty = answers.find(a => a.questionId === 'difficulty')?.value;
    const performance = answers.find(a => a.questionId === 'performance')?.value;
    const goal = answers.find(a => a.questionId === 'goal')?.value;
    const grade = answers.find(a => a.questionId === 'grade')?.value;

    let diagnosis = '';
    let recommendation = '';
    let duration = '';
    let color = 'from-indigo-500 to-purple-600';

    // Smart diagnosis logic
    if (difficulty === 'basics') {
        diagnosis = '🎯 Teşhis: Temel Kavram Eksikliği';
        recommendation = 'Öncelikle temel konuları pekiştirip, adım adım ilerleme stratejisi ile sağlam bir matematik altyapısı oluşturacağız.';
        duration = '6-8 Haftalık Yoğun Temel Kampı';
        color = 'from-orange-500 to-red-600';
    } else if (difficulty === 'new-gen') {
        diagnosis = '🧩 Teşhis: Okuduğunu Anlama ve Mantık Muhakeme Eksikliği';
        recommendation = 'Yeni nesil soruları çözmek için stratejik yaklaşım ve soru analizi çalışmaları yapacağız. Problem çözme becerilerini geliştireceğiz.';
        duration = '4-6 Haftalık Yeni Nesil Soru Kampı';
        color = 'from-blue-500 to-indigo-600';
    } else if (difficulty === 'operations') {
        diagnosis = '⚠️ Teşhis: Dikkat ve Hız Problemi';
        recommendation = 'Bildiği konularda yapılan hataları minimize etmek için dikkat artırıcı teknikleri ve pratik stratejileri uygulayacağız.';
        duration = '3-4 Haftalık Sınav Stratejisi Eğitimi';
        color = 'from-amber-500 to-orange-600';
    } else if (difficulty === 'time') {
        diagnosis = '⏱️ Teşhis: Hız ve Zaman Yönetimi Sorunu';
        recommendation = 'Hızlı çözüm teknikleri, kısa yol stratejileri ve zaman yönetimi becerileri kazandıracağız.';
        duration = '3-4 Haftalık Hız Geliştirme Programı';
        color = 'from-green-500 to-teal-600';
    }

    // Adjust for high performers
    if (performance === 'excellent' || goal === 'top-school') {
        diagnosis = '🏆 Teşhis: Zirveye Yolculuk';
        recommendation = 'Hedef okula ulaşmak için ileri düzey sorular, olimpiyat soruları ve tam puan stratejileri üzerinde çalışacağız.';
        duration = '8-12 Haftalık Derece Programı';
        color = 'from-purple-500 to-pink-600';
    }

    return { diagnosis, recommendation, duration, color, answers };
};

const AnalysisWizard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    if (!isOpen) return null;

    const handleAnswer = (value: string, label: string) => {
        const newAnswers = [...answers, { questionId: questions[currentStep].id, value, label }];
        setAnswers(newAnswers);

        setSlideDirection('right');
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
            setSlideDirection('left');
            setTimeout(() => {
                setCurrentStep(currentStep - 1);
                setAnswers(answers.slice(0, -1));
            }, 150);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setAnswers([]);
        setShowResult(false);
        setSlideDirection('right');
    };

    const result = showResult ? getAnalysisResult(answers) : null;
    const progress = ((currentStep + 1) / questions.length) * 100;

    // Generate WhatsApp message
    const generateWhatsAppMessage = () => {
        if (!result) return '';
        const gradeAnswer = answers.find(a => a.questionId === 'grade')?.label || '';
        const difficultyAnswer = answers.find(a => a.questionId === 'difficulty')?.label || '';

        return `Merhaba Şeyda Hocam, sitedeki Matematik Başarı Analizi'ni yaptım.

📊 Analiz Sonucu:
• Sınıf: ${gradeAnswer}
• Zorluk: ${difficultyAnswer}
• ${result.diagnosis}

Detaylı bilgi almak ve özel program oluşturmak istiyorum.`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
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
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-800">Matematik Başarı Analizörü</h3>
                                <span className="text-sm font-semibold text-indigo-600">
                                    {currentStep + 1} / {questions.length}
                                </span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-8">
                            <div
                                key={currentStep}
                                className={`animate-slideIn${slideDirection === 'right' ? 'Right' : 'Left'}`}
                            >
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                                        {currentStep + 1}
                                    </span>
                                    <span>{questions[currentStep].question}</span>
                                </h2>

                                <div className="space-y-3">
                                    {questions[currentStep].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option.value, option.label)}
                                            className="w-full text-left px-6 py-4 bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl transition-all font-medium text-slate-700 hover:text-indigo-700 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option.label}</span>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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
                                    Geri
                                </button>
                            )}
                        </div>
                    </>
                ) : result && (
                    <div className="p-8 text-center">
                        {/* Success Icon */}
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${result.color} mb-6 animate-bounce`}>
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>

                        {/* Diagnosis */}
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            {result.diagnosis}
                        </h2>

                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-slate-200">
                            <p className="text-lg text-slate-700 leading-relaxed mb-4">
                                {result.recommendation}
                            </p>
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-200">
                                <Target className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-700">{result.duration}</span>
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
                                Analiz Sonucunu Şeyda Hocaya Gönder ve Çözüm Planla
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
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default AnalysisWizard;
