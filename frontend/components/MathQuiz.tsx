/**
 * MathQuiz.tsx - Interactive LGS Readiness Quiz
 * Helps parents assess their child's math preparation level
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle, Trophy, MessageCircle } from 'lucide-react';

interface QuizAnswer {
    question: string;
    options: { text: string; value: number }[];
}

const quizQuestions: QuizAnswer[] = [
    {
        question: "Matematik denemelerinde kaç net yapıyor?",
        options: [
            { text: "5 netten az", value: 0 },
            { text: "5-10 net arası", value: 1 },
            { text: "10-15 net arası", value: 2 },
            { text: "15+ net", value: 3 }
        ]
    },
    {
        question: "Günde kaç saat matematik çalışıyor?",
        options: [
            { text: "0-30 dakika", value: 0 },
            { text: "30 dakika - 1 saat", value: 1 },
            { text: "1-2 saat", value: 2 },
            { text: "2+ saat", value: 3 }
        ]
    },
    {
        question: "Yeni nesil sorularda zorlanıyor mu?",
        options: [
            { text: "Çok zorlanıyor", value: 0 },
            { text: "Bazen zorlanıyor", value: 1 },
            { text: "Genelde hallediyor", value: 2 },
            { text: "Rahatça çözüyor", value: 3 }
        ]
    }
];

const getResult = (score: number) => {
    if (score >= 7) {
        return {
            title: "🎉 Harika Bir Temele Sahip!",
            message: "Çocuğunuz güçlü bir başlangıca sahip. Özel ders desteğiyle hedef okula ulaşması çok yakın!",
            color: "from-green-500 to-emerald-600"
        };
    } else if (score >= 4) {
        return {
            title: "💪 Gelişime Açık Alan Var",
            message: "Doğru strateji ve rehberlikle net sayısını kısa sürede artırabilir. Kişiselleştirilmiş bir program fark yaratacak!",
            color: "from-amber-500 to-orange-600"
        };
    } else {
        return {
            title: "🎯 Temelden Başlayalım",
            message: "Temel eksikler var ama endişe yok! Doğru yaklaşımla matematik sevgisi kazandırıp, sağlam bir temel oluşturabiliriz.",
            color: "from-red-500 to-rose-600"
        };
    }
};

const MathQuiz: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAnswer = (value: number) => {
        const newAnswers = [...answers, value];
        setAnswers(newAnswers);

        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setShowResult(false);
    };

    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    const result = getResult(totalScore);

    if (!isOpen) {
        return (
            <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
                        <Trophy className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            Çocuğunuz LGS'ye Ne Kadar Hazır?
                        </h2>
                        <p className="text-lg text-slate-600 mb-6">
                            3 basit soruyla öğrencinizin matematik seviyesini keşfedin!
                        </p>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            🎯 Hemen Test Et
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
                    {!showResult ? (
                        <>
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-purple-600">
                                        Soru {currentQuestion + 1} / {quizQuestions.length}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                                        style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">
                                {quizQuestions[currentQuestion].question}
                            </h3>

                            {/* Options */}
                            <div className="space-y-3">
                                {quizQuestions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option.value)}
                                        className="w-full text-left px-6 py-4 bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-400 rounded-xl transition-all font-medium text-slate-700 hover:text-purple-700"
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Result */}
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${result.color} mb-6`}>
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>

                                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                                    {result.title}
                                </h3>

                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    {result.message}
                                </p>

                                {/* Score */}
                                <div className="bg-slate-50 rounded-xl p-4 mb-8">
                                    <p className="text-sm text-slate-500 mb-2">Toplam Puan</p>
                                    <p className="text-4xl font-bold text-purple-600">{totalScore} / 9</p>
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-3">
                                    <a
                                        href="https://wa.me/905337652071?text=Merhaba,%20LGS%20hazırlık%20testi%20yaptım.%20Ücretsiz%20analiz%20almak%20istiyorum."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        WhatsApp'tan Ücretsiz Analiz İste
                                    </a>

                                    <button
                                        onClick={resetQuiz}
                                        className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        🔄 Tekrar Dene
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MathQuiz;
