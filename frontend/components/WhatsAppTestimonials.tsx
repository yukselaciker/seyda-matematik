/**
 * WhatsAppTestimonials.tsx - Social Proof Wall with WhatsApp-style bubbles
 * Premium testimonials section that looks like real WhatsApp messages
 */

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface WhatsAppMessage {
    sender: string;
    message: string;
    time: string;
    isTeacher?: boolean;
}

interface Conversation {
    parentName: string;
    studentGrade: string;
    messages: WhatsAppMessage[];
}

const conversations: Conversation[] = [
    {
        parentName: "Ayşe Hanım",
        studentGrade: "8. Sınıf - Efe",
        messages: [
            { sender: "Veli", message: "Hocam merhaba, Efe'nin son sınav sonucu geldi! 😊", time: "14:32" },
            { sender: "Hoca", message: "Merhaba! Nasıl geçti bakalım?", time: "14:33", isTeacher: true },
            { sender: "Veli", message: "Matematik 92 aldı! 45'ten 92'ye çıktı. İnanamıyorum 🎉", time: "14:34" },
            { sender: "Hoca", message: "Harika! Efe çok çalıştı, hak etti 💪", time: "14:35", isTeacher: true }
        ]
    },
    {
        parentName: "Mehmet Bey",
        studentGrade: "7. Sınıf - Zeynep",
        messages: [
            { sender: "Veli", message: "Hocam Zeynep artık kendisi ders çalışmak istiyor!", time: "19:45" },
            { sender: "Veli", message: "Daha önce zorla oturtuyorduk 😅", time: "19:45" },
            { sender: "Hoca", message: "Çok sevindim! Matematik sevdirmek en önemli hedefim 🎯", time: "19:48", isTeacher: true }
        ]
    },
    {
        parentName: "Fatma Hanım",
        studentGrade: "6. Sınıf - Can",
        messages: [
            { sender: "Veli", message: "LGS deneme sonuçları açıklandı", time: "20:15" },
            { sender: "Veli", message: "Matematik net sayısı 5'ten 15'e çıktı! 🚀", time: "20:15" },
            { sender: "Hoca", message: "Süper! 2 ayda büyük ilerleme. Devam ediyoruz ✨", time: "20:20", isTeacher: true }
        ]
    },
    {
        parentName: "Ali Bey",
        studentGrade: "8. Sınıf - Elif",
        messages: [
            { sender: "Veli", message: "Elif okula gidip matematik hocasına 'ben bu konuyu biliyorum' demiş 😄", time: "16:30" },
            { sender: "Hoca", message: "Özgüveni yerine gelmiş, çok mutlu oldum! 🌟", time: "16:35", isTeacher: true }
        ]
    }
];

const WhatsAppTestimonials: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-[#1C2A5E] mb-4">
                        Velilerimizden Mesajlar
                    </h2>
                </div>

                {/* WhatsApp Conversations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {conversations.map((conv, idx) => (
                        <div
                            key={idx}
                            className="bg-[#e5ddd5] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
                            style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABSSURBVGiB7c0xAQAACAOgaaz/ckGDpwaYk3Q16wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABg2p9n/wMAAAAAAAAAAAAAAAAAvr0B5GYBP7i0hYoAAAAASUVORK5CYII=")' }}
                        >
                            {/* Header */}
                            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-bold">
                                    {conv.parentName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold">{conv.parentName}</p>
                                    <p className="text-xs text-green-200">{conv.studentGrade}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 space-y-2">
                                {conv.messages.map((msg, msgIdx) => (
                                    <div
                                        key={msgIdx}
                                        className={`flex ${msg.isTeacher ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${msg.isTeacher
                                                ? 'bg-white text-slate-800 rounded-tl-none'
                                                : 'bg-[#dcf8c6] text-slate-800 rounded-tr-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-slate-500">{msg.time}</span>
                                                {!msg.isTeacher && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhatsAppTestimonials;
