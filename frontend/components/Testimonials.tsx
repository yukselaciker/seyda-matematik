import React, { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(scroll);
    }, 1000);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-indigo-100">
            <div className="text-4xl font-bold text-indigo-600 mb-2">150+</div>
            <p className="text-sm text-slate-600">Mutlu Öğrenci</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-100">
            <div className="text-4xl font-bold text-green-600 mb-2">+35</div>
            <p className="text-sm text-slate-600">Ortalama Not Artışı</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-amber-100">
            <div className="text-4xl font-bold text-amber-600 mb-2">%92</div>
            <p className="text-sm text-slate-600">LGS Başarı Oranı</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Başarı Hikayeleri</h2>
          <p className="mt-2 text-4xl font-serif font-bold text-[#1C2A5E]">
            Gurur Tablomuz & Veli Görüşleri
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
            Öğrencilerimin başarıları ve velilerimizin değerli geri bildirimleri
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {duplicatedTestimonials.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col relative"
            >
              <Quote className="absolute top-4 right-4 h-6 w-6 text-indigo-100" />

              <div className="mb-4">
                <div className="flex space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <blockquote className="flex-1 mb-4">
                <p className="text-slate-600 italic leading-relaxed text-sm line-clamp-4">
                  "{item.message}"
                </p>
              </blockquote>

              {/* Grades highlight */}
              {item.grades && item.grades.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {item.grades.slice(0, 2).map((grade, gIndex) => (
                    <span
                      key={gIndex}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${grade.includes('100') || grade.includes('9') ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto border-t border-slate-100 pt-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <p className="text-center text-sm text-slate-400 mt-4">
          ← Kaydırarak daha fazla görüş okuyun →
        </p>
      </div>
    </section>
  );
};

export default Testimonials;