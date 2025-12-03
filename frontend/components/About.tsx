import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Hakkımda</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Merhaba, Ben Şeyda
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
            Matematiği seven ve sevdiren bir eğitim yolculuğu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg text-slate-600">
                <p className="mb-4">
                    Kırıkkale Fen Lisesi ve Kırıkkale Üniversitesi mezunuyum. Öğrencilerle çalışmayı, matematiği anlaşılır ve kolay hâle getirmeyi çok seviyorum.
                </p>
                <p className="mb-4">
                    7 yıldır ilköğretim ve ortaöğretim düzeyindeki öğrencilere birebir özel ders veriyor, onların hem akademik başarılarını hem de özgüvenlerini artırmayı hedefliyorum.
                </p>
                <p className="mb-6">
                    Her öğrencinin öğrenme biçiminin farklı olduğuna inanıyorum. Bu yüzden derslerimde; <span className="text-indigo-600 font-bold">seviyeye uygun, sade ve etkili anlatımı</span>; kişiye özel çalışma planlarıyla birleştiriyorum. Öğrencilerimin gelişimini adım adım takip ediyor, velilerle düzenli olarak iletişimde kalıyorum.
                </p>
                <blockquote className="border-l-4 border-indigo-500 pl-4 italic bg-slate-50 py-2 pr-2 rounded-r-lg">
                    "Hedefim, öğrencilerimin sadece sınavlarda değil, öğrenme yolculuklarında da kendilerini güçlü ve motive hissetmelerini sağlamak."
                </blockquote>
            </div>
            
            <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-blue-200 transform rotate-3 rounded-3xl shadow-lg"></div>
                 <div className="relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">🎓</span>
                        Eğitim & Deneyim
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center border border-green-200 mt-0.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </div>
                            <div className="ml-4">
                                <p className="text-lg font-medium text-slate-900">Kırıkkale Üniversitesi</p>
                                <p className="text-slate-500">Mezun</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center border border-green-200 mt-0.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </div>
                            <div className="ml-4">
                                <p className="text-lg font-medium text-slate-900">Kırıkkale Fen Lisesi</p>
                                <p className="text-slate-500">Mezun</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mt-0.5">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            </div>
                            <div className="ml-4">
                                <p className="text-lg font-medium text-slate-900">7 Yıllık Deneyim</p>
                                <p className="text-slate-500">İlköğretim & Ortaöğretim Düzeyi</p>
                            </div>
                        </li>
                    </ul>
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default About;