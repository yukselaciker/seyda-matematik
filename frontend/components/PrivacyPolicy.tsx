/**
 * PrivacyPolicy.tsx - Privacy Policy Page
 * 
 * Turkish (KVKK compliant) privacy policy for tutoring website
 */

import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1C2A5E] to-indigo-700 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <a
                        href="/"
                        className="inline-flex items-center text-indigo-200 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Ana Sayfaya Dön
                    </a>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-xl">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
                            <p className="text-indigo-200 mt-1">Son güncelleme: Aralık 2024</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-slate max-w-none">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Giriş</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Şeyda Açıker Özel Matematik Dersleri ("biz", "şirketimiz" veya "hizmetlerimiz") olarak,
                            kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası,
                            web sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda kişisel verilerinizi
                            nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Toplanan Bilgiler</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Web sitemiz aracılığıyla aşağıdaki kişisel bilgileri toplayabiliriz:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>İletişim Bilgileri:</strong> Ad-soyad, e-posta adresi, telefon numarası</li>
                            <li><strong>Form Verileri:</strong> İletişim formları aracılığıyla gönderdiğiniz mesajlar</li>
                            <li><strong>Öğrenci Bilgileri:</strong> Öğrenci sınıf düzeyi, eğitim ihtiyaçları</li>
                            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, ziyaret saatleri (anonim)</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Bilgilerin Kullanımı</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Sizinle iletişim kurmak ve sorularınıza yanıt vermek</li>
                            <li>Ders randevuları oluşturmak ve yönetmek</li>
                            <li>Eğitim hizmetlerimizi sunmak ve geliştirmek</li>
                            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Bilgilerin Paylaşımı</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Kişisel bilgilerinizi üçüncü taraflarla <strong>pazarlama amacıyla satmıyor veya paylaşmıyoruz.</strong>
                            Bilgileriniz yalnızca aşağıdaki durumlarda paylaşılabilir:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                            <li>Yasal zorunluluk halinde (mahkeme kararı vb.)</li>
                            <li>Hizmet sağlayıcılarımızla (e-posta hizmeti gibi) sınırlı olarak</li>
                            <li>Açık izniniz olduğunda</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Veri Güvenliği</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Kişisel verilerinizi korumak için uygun teknik ve organizasyonel güvenlik önlemleri alıyoruz.
                            Bu önlemler arasında şifreli iletişim (SSL/TLS), güvenli sunucular ve erişim kontrolleri bulunmaktadır.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Çerezler (Cookies)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanabilir.
                            Çerezler, tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır.
                            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">7. KVKK Kapsamında Haklarınız</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                            <li>Kişisel verilerinizin düzeltilmesini veya silinmesini isteme</li>
                            <li>Kişisel verilerinizin işlenmesine itiraz etme</li>
                            <li>Kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">8. İletişim</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Gizlilik politikamız hakkında sorularınız veya kişisel verilerinizle ilgili talepleriniz için
                            bizimle iletişime geçebilirsiniz:
                        </p>
                        <div className="bg-slate-50 rounded-xl p-6 mt-4 border border-slate-200">
                            <p className="font-semibold text-slate-800">Şeyda Açıker</p>
                            <p className="text-slate-600">E-posta: seyda.aciker@gmail.com</p>
                            <p className="text-slate-600">Telefon: +90 533 765 20 71</p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Politika Değişiklikleri</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda
                            web sitemizde duyuru yapacağız. Bu sayfayı düzenli olarak kontrol etmenizi öneririz.
                        </p>
                    </section>

                </div>

                {/* Back Button */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-[#1C2A5E] text-white rounded-xl font-semibold hover:bg-indigo-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Ana Sayfaya Dön
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
