import React from 'react';
import { X, Calendar, MessageCircle, Phone, CheckCircle, Clock, GraduationCap } from 'lucide-react';

// ============================================
// WHATSAPP CONFIGURATION
// ============================================
const WHATSAPP_NUMBER = '905337652071'; // Without + sign
const WHATSAPP_MESSAGE = encodeURIComponent(
  `Merhaba Şeyda Hocam! 👋

Web sitenizden ulaşıyorum. Özel ders hakkında bilgi almak ve demo ders randevusu oluşturmak istiyorum.

📚 Öğrenci bilgileri:
- Sınıf: 
- Konu/İhtiyaç: 

Uygun olduğunuzda dönüş yapabilir misiniz? Teşekkürler! 🙏`
);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">

          {/* Close Button */}
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6 pt-8 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-900 mb-3" id="modal-title">
              Demo Ders Randevusu
            </h3>

            <p className="text-slate-600 mb-6">
              Ücretsiz tanışma ve seviye belirleme dersi için WhatsApp üzerinden hızlıca randevu alabilirsiniz.
            </p>

            {/* Features */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-slate-700">Ücretsiz 1 saat tanışma dersi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-700">Seviye belirleme ve müfredat planı</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-700">Esnek saat seçenekleri</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-600 hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="h-6 w-6" />
              WhatsApp ile Randevu Al
            </a>

            {/* Alternative */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">veya doğrudan arayın:</p>
              <a
                href="tel:+905337652071"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                +90 533 765 20 71
              </a>
            </div>

            {/* Close link */}
            <button
              onClick={onClose}
              className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Daha sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;