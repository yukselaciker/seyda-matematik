/**
 * FAQ.tsx - Frequently Asked Questions Section
 * 
 * Critical for conversion optimization:
 * - Reduces friction by answering objections
 * - Builds trust through transparency
 * - Improves SEO with question-based keywords
 */

import React, { useState, memo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Dersler online mı yoksa yüz yüze mi?",
    answer: "Her iki seçenek de mevcut. Online dersler Zoom üzerinden interaktif tahta ile yapılır ve yüz yüze derslerle aynı kalitededir. Yüz yüze dersler İstanbul Avrupa yakasında gerçekleşir. Sizin için en uygun olanı birlikte belirleriz."
  },
  {
    question: "Deneme dersi ücretsiz mi?",
    answer: "Evet! İlk 1 saatlik tanışma dersi tamamen ücretsizdir. Bu derste öğrencinizin seviyesini tespit eder, eksik konuları belirler ve kişisel çalışma planı oluştururuz. Hiçbir ödeme veya yükümlülük gerektirmez."
  },
  {
    question: "Hangi sınıf seviyelerine ders veriyorsunuz?",
    answer: "4. sınıftan 10. sınıfa kadar tüm öğrencilere matematik dersi veriyorum. Ayrıca LGS hazırlık programım ile 8. sınıf öğrencilerine yoğun sınav hazırlığı desteği sağlıyorum. Her seviyeye özel materyaller ve çalışma planları kullanıyorum."
  },
  {
    question: "Ders saatleri esnek mi?",
    answer: "Kesinlikle! Her gün 09:00-20:00 saatleri arasında esnek saatler sunuyorum. Öğrencinizin okul programına ve ailenizin ihtiyaçlarına göre en uygun saatleri birlikte belirleriz."
  },
  {
    question: "Ödev takibi yapılıyor mu?",
    answer: "Evet! Her dersten sonra öğrenciye özel çalışma planı ve ödevler veriyorum. Ödevler WhatsApp üzerinden paylaşılır ve kontrol edilir. Ayrıca haftalık ilerleme raporları ile velileri bilgilendiriyorum."
  },
  {
    question: "Kaç öğrenci ile aynı anda ders yapıyorsunuz?",
    answer: "Hem birebir hem de grup dersleri yapıyorum. Grup derslerimiz en fazla 3 kişilik küçük gruplardan oluşur. Birebir derslerde öğrenciye %100 odaklanırken, grup derslerinde arkadaşlarla birlikte öğrenme avantajı sunuyorum. Size en uygun olanı birlikte belirleriz."
  }
];

const FAQ: React.FC = memo(() => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-[#1C2A5E] mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Velilerin en çok merak ettiği sorular ve cevapları. Aklınıza takılan başka bir soru varsa, lütfen iletişime geçin!
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-slate-50"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-slate-800 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${openIndex === index
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA at bottom */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Başka sorularınız mı var?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-4 bg-[#1C2A5E] text-white rounded-xl font-semibold hover:bg-indigo-900 transition-colors shadow-lg hover:shadow-xl"
          >
            📞 Hemen İletişime Geçin
          </a>
        </div>
      </div>
    </section>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;
