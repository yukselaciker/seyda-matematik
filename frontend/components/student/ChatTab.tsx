/**
 * ChatTab - Interactive AI Math Assistant Chat
 * 
 * Features:
 * - Real-time chat with simulated AI responses
 * - Typing indicator with delay
 * - Auto-scroll to latest message
 * - Persists chat history to localStorage
 * - Clear chat option
 * - Smart bot responses based on keywords
 * - Enter to send, Shift+Enter for new line
 */

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Brain, Send, Trash2, Sparkles, User } from 'lucide-react';

// --- TYPES ---
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  isTyping?: boolean;
}

interface ChatTabProps {
  userId?: string;
  onXpGain?: (amount: number) => void;
}

// --- CONSTANTS ---
const STORAGE_KEY = 'app_chat_messages';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: 'Merhaba! 👋 Ben Matematik Asistanı. Sana nasıl yardımcı olabilirim?\n\nBana şunları sorabilirsin:\n• Matematik problemleri\n• Konu açıklamaları\n• Çalışma tavsiyeleri\n• LGS hazırlık ipuçları',
  sender: 'bot',
  time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
};

// Smart responses based on keywords
const SMART_RESPONSES: { keywords: string[]; responses: string[] }[] = [
  {
    keywords: ['merhaba', 'selam', 'hey', 'günaydın', 'iyi günler'],
    responses: [
      'Merhaba! 😊 Bugün hangi konuda yardımcı olabilirim?',
      'Selam! Matematik dünyasında keşfe hazır mısın? 🚀',
      'Hey! Sorularını bekliyorum, birlikte çözelim!',
    ],
  },
  {
    keywords: ['teşekkür', 'sağol', 'eyvallah', 'thanks'],
    responses: [
      'Rica ederim! Başka sorun olursa yaz. 😊',
      'Ne demek, yardımcı olabildiysem ne mutlu bana! ✨',
      'Her zaman! Çalışmaya devam, harikasın! 💪',
    ],
  },
  {
    keywords: ['üslü', 'üs', 'kuvvet'],
    responses: [
      '📐 **Üslü İfadeler** hakkında:\n\n• a^n = a × a × ... × a (n tane)\n• a^0 = 1 (a ≠ 0)\n• a^(-n) = 1/a^n\n\nÖrnek: 2^3 = 2 × 2 × 2 = 8\n\nBelirli bir soru var mı?',
      'Üslü ifadelerde en önemli kurallar:\n\n1. a^m × a^n = a^(m+n)\n2. a^m ÷ a^n = a^(m-n)\n3. (a^m)^n = a^(m×n)\n\nHangi konuda takıldın?',
    ],
  },
  {
    keywords: ['karekök', 'kök', 'radikal'],
    responses: [
      '📐 **Karekök** hakkında:\n\n• √a × √b = √(a×b)\n• √a ÷ √b = √(a÷b)\n• (√a)² = a\n\nÖrnek: √16 = 4 çünkü 4² = 16\n\nNe sormak istersin?',
      'Karekökte sadeleştirme:\n\n√50 = √(25×2) = 5√2\n√72 = √(36×2) = 6√2\n\nİpucu: Sayıyı asal çarpanlarına ayır! 💡',
    ],
  },
  {
    keywords: ['geometri', 'üçgen', 'alan', 'çevre', 'açı'],
    responses: [
      '📐 **Geometri** temel formülleri:\n\n• Üçgen Alan = (taban × yükseklik) / 2\n• Dikdörtgen Alan = uzunluk × genişlik\n• Çember Çevre = 2πr\n• Çember Alan = πr²\n\nHangi konuda yardım lazım?',
      'Üçgen açı toplamı = 180°\nDörtgen açı toplamı = 360°\n\n💡 İpucu: Dış açı = İç açının bütünleri!',
    ],
  },
  {
    keywords: ['lgs', 'sınav', 'hazırlık', 'deneme'],
    responses: [
      '🎯 **LGS Hazırlık Tavsiyeleri:**\n\n1. Her gün en az 20 soru çöz\n2. Yanlışlarını mutlaka not al\n3. Zaman yönetimi çok önemli\n4. Denemeleri gerçek sınav gibi çöz\n\nHangi konuda eksik hissediyorsun?',
      'LGS başarısı için:\n\n📚 Konu tekrarı → Test çözümü → Deneme\n\nZaman Dağılımı:\n• Matematik: 35 dk\n• Fen: 30 dk\n• Türkçe: 30 dk\n• Sosyal: 20 dk\n\nBirlikte çalışalım! 💪',
    ],
  },
  {
    keywords: ['zor', 'anlamıyorum', 'yapamıyorum', 'yardım'],
    responses: [
      'Endişelenme, her zor konu bir gün kolaylaşır! 💪\n\nBana soruyu adım adım anlat, birlikte çözelim.',
      'Zorlandığın konuyu öğrenmek cesaret ister, aferin sana! 🌟\n\nHangi adımda takıldın, bakalım birlikte.',
      'Anlamadığın bir şey olması normal, öğrenme böyle işler!\n\nSoruyu paylaş, beraber inceleyelim. 📝',
    ],
  },
  {
    keywords: ['problem', 'soru', 'çöz', 'nasıl'],
    responses: [
      'Soruyu paylaş, birlikte adım adım çözelim! 📝\n\n💡 İpucu: Önce verilenleri ve isteneni belirle.',
      'Problem çözümünde altın kural:\n\n1. Verilenleri yaz\n2. İsteneni belirle\n3. İlgili formülü bul\n4. Adım adım çöz\n5. Sonucu kontrol et',
    ],
  },
];

const DEFAULT_RESPONSES = [
  'Harika bir soru! Bu konuda sana yardımcı olabilirim. Detay verir misin?',
  'İlginç! Bunu birlikte keşfedelim. 🔍',
  'Güzel soru! Adım adım ilerleyelim.',
  'Bu konuyu açıklamak için önce temel kavramları gözden geçirelim.',
  'Anladım. Sana bu konuda birkaç örnek vereyim.',
  'Pratik yaparak öğrenmek en iyisi! Bir soru denemek ister misin?',
  'Bu çok sorulur! İşte basit açıklaması...',
];

// --- STORAGE HELPERS ---
const getStoredMessages = (userId?: string): ChatMessage[] => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (stored) {
      const messages = JSON.parse(stored);
      if (Array.isArray(messages) && messages.length > 0) {
        return messages;
      }
    }
  } catch (e) {
    console.error('Failed to load chat messages', e);
  }
  return [INITIAL_MESSAGE];
};

const saveMessages = (messages: ChatMessage[], userId?: string): void => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    // Don't save typing indicators
    const messagesToSave = messages.filter(m => !m.isTyping);
    localStorage.setItem(key, JSON.stringify(messagesToSave));
  } catch (e) {
    console.error('Failed to save chat messages', e);
  }
};

// --- SMART RESPONSE GENERATOR ---
const generateResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for keyword matches
  for (const category of SMART_RESPONSES) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category.responses[Math.floor(Math.random() * category.responses.length)];
    }
  }
  
  // Default response
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
};

// --- MESSAGE BUBBLE COMPONENT ---
interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message }) => {
  const isUser = message.sender === 'user';
  
  if (message.isTyping) {
    return (
      <div className="flex justify-start">
        <div className="bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
          <Brain className="w-4 h-4 text-indigo-600" />
        </div>
      )}
      <div className={`
        max-w-[75%] rounded-2xl p-4 shadow-sm
        ${isUser 
          ? 'bg-[#1C2A5E] text-white rounded-tr-none' 
          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
        }
      `}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <p className={`text-[10px] mt-2 text-right ${
          isUser ? 'text-indigo-200' : 'text-slate-400'
        }`}>
          {message.time}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2 flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// --- MAIN CHAT COMPONENT ---
export const ChatTab: React.FC<ChatTabProps> = memo(({ userId, onXpGain }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessages(userId));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages when they change
  useEffect(() => {
    saveMessages(messages, userId);
  }, [messages, userId]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: trimmedInput,
      sender: 'user',
      time: timeStr,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      text: '',
      sender: 'bot',
      time: '',
      isTyping: true,
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, typingMessage]);
    }, 300);

    // Simulate bot typing delay (1-2 seconds)
    const typingDelay = 1000 + Math.random() * 1000;
    
    typingTimeoutRef.current = setTimeout(() => {
      // Generate smart response
      const response = generateResponse(trimmedInput);
      
      const botMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        text: response,
        sender: 'bot',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      // Remove typing indicator and add real message
      setMessages(prev => [...prev.filter(m => !m.isTyping), botMessage]);
      setIsTyping(false);

      // Gain XP for asking questions
      onXpGain?.(5);
    }, typingDelay);
  }, [input, isTyping, onXpGain]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Sohbet geçmişini silmek istediğinize emin misiniz?')) {
      setMessages([INITIAL_MESSAGE]);
    }
  }, []);

  const suggestionQuestions = [
    'LGS\'ye nasıl hazırlanmalıyım?',
    'Karekök konusunu açıkla',
    'Üslü ifadeler nedir?',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[650px] flex flex-col overflow-hidden animate-fadeIn transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Brain size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1">
              Matematik Asistanı
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-green-600 font-medium">
              {isTyping ? 'Yazıyor...' : 'Çevrimiçi'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Sohbeti temizle"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <p className="text-xs text-slate-500 mb-2">Önerilen sorular:</p>
          <div className="flex flex-wrap gap-2">
            {suggestionQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <textarea 
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir soru sor... (Enter ile gönder)"
            className="flex-1 border border-slate-200 bg-white text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
            rows={1}
            disabled={isTyping}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Her soru için +5 XP • Shift+Enter yeni satır
        </p>
      </div>
    </div>
  );
});

ChatTab.displayName = 'ChatTab';

export default ChatTab;
