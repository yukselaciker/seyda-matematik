import React from 'react';
import { FEATURES } from '../constants';

const Features: React.FC = () => {
  return (
    <section id="whyme" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
            
          <div className="lg:col-span-1">
             <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-4">
                Neden Ben?
             </h2>
             <p className="text-lg text-slate-500 mb-8">
                Başarı tesadüf değildir. Doğru rehberlik, düzenli çalışma ve güçlü bir iletişimle her öğrenci potansiyeline ulaşabilir.
             </p>
             <div className="hidden lg:block relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
                <img 
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Matematik Çalışma ve Başarı" 
                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-indigo-900/10"></div>
             </div>
          </div>

          <div className="mt-12 lg:mt-0 lg:col-span-2">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {FEATURES.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div key={index} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                            <div className="relative p-6 bg-white border border-slate-200 rounded-xl h-full shadow-sm group-hover:shadow-none transition-shadow">
                                <div className="flex items-center mb-4">
                                    <Icon className="h-6 w-6 text-indigo-600 mr-3" />
                                    <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;