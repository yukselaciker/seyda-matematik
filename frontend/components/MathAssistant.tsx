import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';

const MathAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        setError("Sistem hatası: API anahtarı yapılandırılmamış. Lütfen daha sonra tekrar deneyin.");
        return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Using gemini-3-pro-preview for complex math tasks (STEM)
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: question,
        config: {
            systemInstruction: "Sen yardımsever, sabırlı ve motive edici bir matematik öğretmenisin. Adın 'Şeyda Asistan'. Öğrencilerin sorduğu matematik sorularını veya kavramlarını Türkçe olarak açıkla. Cevabı direkt vermek yerine, konuyu adım adım, mantığını kavratarak ve sade bir dille anlat. Ortaokul ve lise seviyesine uygun, samimi bir dil kullan. Cevaplarını Markdown formatında düzenle (kalın başlıklar, maddeler vb. kullan). Matematiksel ifadeleri net yaz.",
        }
      });
      
      setResponse(result.text || "Üzgünüm, şu an bir cevap oluşturamadım. Lütfen sorunu biraz daha detaylandırır mısın?");
    } catch (err) {
      console.error(err);
      setError("Bağlantı sırasında bir sorun oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-helper" className="py-20 bg-indigo-900 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 text-white text-9xl font-serif">∫</div>
            <div className="absolute bottom-10 right-10 text-white text-9xl font-serif">∑</div>
            <div className="absolute top-1/2 left-1/4 text-white text-9xl font-serif">π</div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-800 rounded-full mb-4">
            <Sparkles className="text-yellow-400 h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Matematik Asistanı
          </h2>
          <p className="mt-4 text-indigo-200 text-lg">
            Aklına takılan bir matematik kavramı mı var? Yapay zeka destekli asistanıma sorabilirsin.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col space-y-4">
            <label htmlFor="question" className="text-slate-700 font-medium">Sorunuz:</label>
            <div className="relative">
                <textarea
                id="question"
                rows={3}
                disabled={loading}
                className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 p-4 text-slate-900 resize-none disabled:opacity-60 disabled:bg-slate-100"
                placeholder="Örn: Pisagor teoremi nedir? veya Türev günlük hayatta ne işe yarar?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk();
                    }
                }}
                />
                <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className="absolute bottom-3 right-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-4 w-4 mr-2" /> Gönder</>}
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 pl-1">
                İpucu: Enter tuşu ile hızlıca gönderebilirsiniz.
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start text-red-700 animate-fadeIn" role="alert">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100 animate-fadeIn shadow-inner" role="status">
              <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
                Asistanın Cevabı
              </h3>
              <div className="prose prose-indigo text-slate-800 max-w-none whitespace-pre-line leading-relaxed">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MathAssistant;