import { BookOpen, GraduationCap, LineChart, MessageCircle, UserCheck, Users, Target, FileText } from 'lucide-react';
import { ServiceItem, FeatureItem, NavItem, TestimonialItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Hakkımda', href: '#about' },
  { label: 'Hizmetler', href: '#services' },
  { label: 'Neden Ben?', href: '#whyme' },
  { label: 'Başarılar', href: '#testimonials' },
  { label: 'İletişim', href: '#contact' },
];

export const SERVICES: ServiceItem[] = [
  {
    title: 'Birebir Özel Ders',
    description: 'Her seviyeden öğrenci için kişiye özel anlatım, örnek çözümleri ve konu pekiştirme çalışmaları. (Online / Yüz Yüze)',
    icon: Users,
  },
  {
    title: 'LGS Hazırlık Programı',
    description: 'Sınav stratejileri, soru çözüm teknikleri, deneme analizleri ve düzenli takip sistemiyle sınava tam hazırlık.',
    icon: GraduationCap,
  },
  {
    title: 'Eksik Tamamlama',
    description: 'Matematik temelinde boşluk yaşayan öğrenciler için adım adım ilerleyen, sade ve anlaşılır bir program.',
    icon: Target,
  },
  {
    title: 'Haftalık İlerleme Raporu',
    description: 'Öğrencinin gelişimi düzenli olarak takip edilir, veliye haftalık detaylı geri bildirim verilir.',
    icon: FileText,
  },
];

export const FEATURES: FeatureItem[] = [
  {
    title: 'Pedagojik Yaklaşım',
    description: 'Matematik eğitiminde uzmanlaşmış, her öğrencinin öğrenme tarzına göre uyarlanmış etkili öğretim yöntemleri kullanıyorum.',
    icon: BookOpen,
  },
  {
    title: '7 Yıllık Deneyim',
    description: 'Farklı seviyelerde yüzlerce öğrenci ile çalıştım; her birinin ihtiyaçlarına uygun yöntem geliştirdim.',
    icon: UserCheck,
  },
  {
    title: 'Kişiye Özel İşleyiş',
    description: 'Tüm dersler öğrencinin seviyesine, hedeflerine ve öğrenme stiline göre planlanır.',
    icon: Users,
  },
  {
    title: 'Düzenli Takip',
    description: 'Denemeler, konu eksikleri ve ilerleme süreci detaylı şekilde analiz edilerek hem öğrenci hem veli bilgilendirilir.',
    icon: LineChart,
  },
  {
    title: 'Güçlü İletişim',
    description: 'Öğrencinin motivasyonunu artıran, velilerle düzenli iletişim kuran bir yaklaşım benimsiyorum.',
    icon: MessageCircle,
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Öğrenci",
    role: "LGS Öğrencisi",
    message: "Hocam coook tesekkur ederım 35den 92 cıkmak sızın sayenızde cok tesekkur ederım.",
    grades: ["Matematik: 92", "Önceki Not: 35"]
  },
  {
    name: "Ali Efe İnaç",
    role: "5. Sınıf Öğrencisi",
    message: "Yazılı notlarımız açıklandı, harika bir sonuç geldi.",
    grades: ["Matematik: 100", "Müzik: 100", "Seçmeli: 100", "Sosyal: 95"]
  },
  {
    name: "Zehra'nın Velisi",
    role: "Veli",
    message: "Hocam merhaba.. Zehra'nın sınavı açıklandı.. Veeee 98 almış.. Emeğinize sağlık..",
    grades: ["Matematik: 98"]
  },
  {
    name: "Mehmet Ali Sudem'in Velisi",
    role: "Veli",
    message: "Matematik bizkide 100 emegınıze saglık 🙏",
    grades: ["Matematik: 100"]
  },
  {
    name: "Erol Atlas (atlAsya)",
    role: "Veli",
    message: "Erol Atlas matematik 100, Fen bilimleri 100, sosyal bilgiler 95 şimdilik açıklananlar bunlar 🤩🥳",
    grades: ["Matematik: 100", "Fen: 100", "Sosyal: 95"]
  },
  {
    name: "Fatma'nın Velisi",
    role: "Veli",
    message: "Fen 100 Matematik 100 hocam 🙏",
    grades: ["Matematik: 100", "Fen: 100"]
  },
  {
    name: "İlknur Hanım",
    role: "Veli",
    message: "Bizim mat 100 fen 90 Türkçe 70. Dikkatsizlikten yapmış hatayı herşey için çok teşekkürler biz çok memnun kaldık 🙏",
    grades: ["Matematik: 100", "Fen: 90"]
  },
  {
    name: "Öğrenci",
    role: "Öğrenci",
    message: "Matematikten 100 aldım hocam. Emekleriniz için teşekkür ederim 💫😍",
    grades: ["Matematik: 100"]
  },
  {
    name: "Ceren Gulnergiz",
    role: "Veli",
    message: "Merhaba Oğuz Ata Türkçe 95 Mat 86 Fen 95 ingilizce 92",
    grades: ["Matematik: 86", "Türkçe: 95", "Fen: 95"]
  },
  {
    name: "Veli",
    role: "Veli",
    message: "90 üstü bekliyormuş konuştum teşekkür ederim.",
    grades: ["Beklenti: 90+"]
  }
];