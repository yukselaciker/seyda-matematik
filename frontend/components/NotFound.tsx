/**
 * NotFound.tsx - 404 Page Not Found
 */

import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="text-9xl font-bold text-indigo-100 mb-4">404</div>

                {/* Icon */}
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    Sayfa Bulunamadı
                </h1>

                {/* Description */}
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    Ana sayfaya dönerek devam edebilirsiniz.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        <Home className="w-5 h-5" />
                        Ana Sayfaya Git
                    </a>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
