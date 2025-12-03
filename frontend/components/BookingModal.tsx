import React, { useState } from 'react';
import { X, Calendar, User, BookOpen, CheckCircle, Loader2, AlertCircle, Mail, Phone, Sun, Sunset, Moon, Clock } from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '../config/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isServerWaking, setIsServerWaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTime) {
      setErrorMessage('Lütfen uygun bir saat aralığı seçiniz.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsServerWaking(false);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const studentName = (formData.get('student_name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const grade = (formData.get('grade') as string) || '';
    const date = (formData.get('date') as string) || '';

    const timeLabel = selectedTime === 'morning'
      ? 'Sabah (09:00 - 12:00)'
      : selectedTime === 'afternoon'
      ? 'Öğle (13:00 - 17:00)'
      : 'Akşam (18:00 - 21:00)';

    // Backend'e gidecek detaylı mesaj
    const detailedMessage = [
      'DEMO DERS TALEBİ DETAYLARI:',
      '---------------------------',
      `Öğrenci Adı: ${studentName}`,
      `Sınıf: ${grade || '- belirtilmedi -'}`,
      `Tarih: ${date || '- belirtilmedi -'}`,
      `Saat Tercihi: ${timeLabel}`,
      `Telefon: ${phone}`,
      `E-posta: ${email}`,
      '---------------------------',
      'Not: Bu mesaj web sitesi üzerindeki "Online Demo Ders Randevusu" formundan otomatik oluşturulmuştur.'
    ].join('\n');

    const payload = {
      name: studentName || 'Bilinmiyor',
      email,
      phone,
      message: detailedMessage,
      source: 'demo_lesson',
      preferredDate: date,
      preferredTimeSlot: selectedTime,
      grade,
    };

    // Use robust apiFetch with timeout and server wake-up detection
    const result = await apiFetch<{ id: string }>(
      API_ENDPOINTS.CONTACT,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => setIsServerWaking(true) // Called if server takes > 5 seconds
    );

    if (result.success) {
      setStep('success');
      form.reset();
      setSelectedTime('');
      setIsServerWaking(false);
      console.log('✅ Demo ders talebi backend üzerinden iletildi');
    } else {
      console.error('❌ Demo ders talebi hatası:', result.error);
      setErrorMessage(result.error || 'Talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      setStep('error');
      setIsServerWaking(false);
    }
    
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [
    { id: 'morning', label: 'Sabah', sub: '09:00 - 12:00', icon: Sun },
    { id: 'afternoon', label: 'Öğle', sub: '13:00 - 17:00', icon: Sunset },
    { id: 'evening', label: 'Akşam', sub: '18:00 - 21:00', icon: Moon },
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100">
          
          {/* Close Button */}
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 'form' || step === 'error' ? (
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Calendar className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-xl font-semibold leading-6 text-slate-900" id="modal-title">
                    Online Demo Ders Randevusu
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500 mb-6">
                      Ücretsiz tanışma ve seviye belirleme dersi için lütfen formu doldurun.
                    </p>

                    {step === 'error' && errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex flex-col text-sm border border-red-100 animate-fadeIn">
                             <div className="flex items-center font-bold mb-1">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Hata Oluştu
                             </div>
                             <p>{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Ad Soyad */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="student_name"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                          placeholder="Öğrenci Adı Soyadı"
                        />
                      </div>

                      {/* Telefon */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                          placeholder="Telefon Numaranız"
                        />
                      </div>

                      {/* E-posta */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                          placeholder="E-posta Adresiniz"
                        />
                      </div>

                      {/* Sınıf Seviyesi */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <select
                          name="grade"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none transition-all cursor-pointer"
                        >
                          <option value="" disabled selected>Sınıf Seviyesi Seçiniz</option>
                          <option value="5">5. Sınıf</option>
                          <option value="6">6. Sınıf</option>
                          <option value="7">7. Sınıf</option>
                          <option value="8">8. Sınıf (LGS)</option>
                          <option value="9">9. Sınıf</option>
                          <option value="10">10. Sınıf</option>
                          <option value="11">11. Sınıf</option>
                          <option value="12">12. Sınıf (YKS)</option>
                        </select>
                      </div>

                      {/* Tarih Seçimi */}
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Uygun Tarih</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                    type="date"
                                    name="date"
                                    min={today}
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all cursor-pointer"
                            />
                        </div>
                      </div>

                      {/* Saat Seçimi (Görsel Butonlar) */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Tercih Edilen Zaman</label>
                        <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map((slot) => {
                                const Icon = slot.icon;
                                const isSelected = selectedTime === slot.id;
                                return (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => setSelectedTime(slot.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon className={`h-6 w-6 mb-1 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                                        <span className="text-sm font-bold">{slot.label}</span>
                                        <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{slot.sub}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Hidden input for form data mapping if needed, though we use state in handleSubmit */}
                        <input type="hidden" name="time" value={selectedTime} />
                      </div>

                      <div className="mt-6 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {isServerWaking ? (
                                <span className="text-xs">
                                  <Clock className="inline w-3 h-3 mr-1" />
                                  Sunucu uyanıyor...
                                </span>
                              ) : 'Gönderiliyor...'}
                            </span>
                          ) : 'Randevu Oluştur'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:col-start-1 sm:mt-0 transition-colors"
                          onClick={onClose}
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 text-center">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Talep Alındı!</h3>
               <p className="text-slate-600 mb-6">
                 Demo ders talebiniz başarıyla hocamıza iletildi. En kısa sürede sizinle iletişime geçilecektir.
               </p>
               <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                  onClick={onClose}
                >
                  Tamam
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;