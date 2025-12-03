import React, { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Instagram, Linkedin, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

// ============================================
// EMAILJS CONFIGURATION
// ============================================
// Get these from: https://dashboard.emailjs.com/
// 1. Create account → Add Email Service (Gmail)
// 2. Create Email Template
// 3. Get Public Key from Account → API Keys

const EMAILJS_SERVICE_ID = 'service_seyda'; // Your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_contact'; // Your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Your EmailJS public key

const Contact: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setErrorMessage('');
    
    if (!formRef.current) return;

    try {
      // Send email directly from browser using EmailJS
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );

      // Success!
      setFormStatus('success');
      formRef.current.reset();
      console.log('✅ EmailJS: Mesaj başarıyla gönderildi');
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
      
    } catch (error: any) {
      // Error occurred
      setFormStatus('error');
      setErrorMessage('Mesajınız gönderilemedi. Lütfen WhatsApp ile iletişime geçin.');
      console.error('❌ EmailJS error:', error);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-6">
              İletişime Geçin
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Öğrencinizin geleceği için bir adım atın. Detaylı bilgi almak, tanışmak veya deneme dersi planlamak için bana ulaşabilirsiniz.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600">
                    <Phone className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Telefon</h3>
                  <a href="tel:+905337652071" className="mt-1 text-slate-500 hover:text-indigo-600 transition-colors block font-medium">+90 533 765 20 71</a>
                  <p className="text-xs text-slate-400 mt-1">Hafta içi 09:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">E-posta</h3>
                  <a href="mailto:seyda.aciker@gmail.com" className="mt-1 text-slate-500 hover:text-indigo-600 transition-colors block font-medium">seyda.aciker@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Konum</h3>
                  <p className="mt-1 text-slate-500">Kırıkkale & Online (Tüm Türkiye)</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex space-x-4">
                <a 
                  href="https://www.instagram.com/hocam_seyda?igsh=MXV1anE4enlzNmRuMg%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-white rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all shadow-sm border border-slate-100"
                >
                    <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="p-3 bg-white rounded-full text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm border border-slate-100">
                    <Linkedin className="h-6 w-6" />
                </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mesaj Gönderin</h3>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">⏱️</span>
                <span>Ortalama yanıt: 2 saat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🔒</span>
                <span>Bilgileriniz güvende</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600">📞</span>
                <span>Zorunlu satış yok</span>
              </div>
            </div>
            
            {formStatus === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3">✅ Mesajınız Alındı!</h4>
                <p className="text-lg text-slate-600 max-w-md mx-auto mb-4">
                  2 saat içinde WhatsApp'tan size dönüş yapacağım.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-sm">
                  <p className="text-sm text-green-800">
                    💬 Acil sorularınız için: <a href="https://wa.me/905337652071" className="font-bold underline">WhatsApp'tan yazın</a>
                  </p>
                </div>
              </div>
            ) : (
              <form ref={formRef} id="contact-form" className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Adınız Soyadınız</label>
                  <input
                    required
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-slate-50"
                    placeholder="Veli veya Öğrenci Adı"
                  />
                  <p className="mt-1 text-xs text-slate-500">Sadece iletişim için kullanılır</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-posta</label>
                      <input
                      required
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-slate-50"
                      placeholder="ornek@email.com"
                      />
                  </div>
                  <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefon</label>
                      <input
                      required
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-slate-50"
                      placeholder="05XX XXX XX XX"
                      />
                      <p className="mt-1 text-xs text-slate-500">WhatsApp üzerinden hızlı yanıt</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">Mesajınız</label>
                  <textarea
                    required
                    id="message"
                    name="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-slate-50"
                    placeholder="Örn: '8. sınıf öğrencim, LGS hazırlık dersi istiyorum'"
                  ></textarea>
                  <p className="mt-1 text-xs text-slate-500">Öğrenci sınıfı ve ihtiyaçlarınızı belirtin</p>
                </div>

                {formStatus === 'error' && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Gönderim Hatası</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{errorMessage || 'Mesajınız gönderilemedi. Lütfen tekrar deneyin.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Notice */}
                <div className="text-xs text-slate-500 text-center">
                  ✅ Gönder butonuna tıklayarak{' '}
                  <a href="#" className="text-indigo-600 hover:underline">Gizlilik Politikası</a>'nı kabul ediyorsunuz
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl"
                >
                  {formStatus === 'sending' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Gönderiliyor...
                    </span>
                  ) : '📩 Mesajı Gönder'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;