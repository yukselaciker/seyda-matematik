/**
 * CookieBanner.tsx - GDPR/KVKK Compliant Cookie Consent Banner
 */

import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user already gave consent
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-800 border-t border-slate-700 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Cookie className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-200 leading-relaxed">
                        Sizlere daha iyi hizmet sunabilmek için sitemizde çerezler kullanılmaktadır.
                        Detaylı bilgi için{' '}
                        <a
                            href="/gizlilik-politikasi"
                            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                            Gizlilik Politikamızı
                        </a>{' '}
                        inceleyebilirsiniz.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg"
                    >
                        Kabul Et
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
