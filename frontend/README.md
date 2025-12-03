# 🎨 Frontend - Şeyda Açıker Matematik Platformu

React + TypeScript + Vite ile geliştirilmiş modern frontend uygulaması.

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Build'i önizle
npm run preview
```

## 📁 Proje Yapısı

```
frontend/
├── components/        # React bileşenleri
│   ├── student/      # Öğrenci paneli bileşenleri
│   └── ...
├── contexts/         # React Context API
├── hooks/           # Custom React hooks
├── services/        # API servisleri
├── utils/           # Yardımcı fonksiyonlar
├── types.ts         # TypeScript type tanımları
├── App.tsx          # Ana uygulama bileşeni
└── index.tsx        # Entry point
```

## 🔧 Teknolojiler

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (CDN)
- **Lucide React** - Icons
- **Recharts** - Charts

## 🌐 Environment Variables

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_API_KEY=your-admin-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Not:** Vite'da environment variable'lar `VITE_` prefix'i ile başlamalıdır.

## 📦 Vercel Deployment

Detaylı deployment rehberi için: [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md)

**Hızlı Deploy:**
1. Vercel Dashboard'a git
2. Yeni proje ekle
3. **Root Directory:** `frontend` seç
4. Deploy et

## 🛠️ Development

### Local Development
```bash
npm run dev
```
Uygulama http://localhost:3000 adresinde çalışır.

### Build
```bash
npm run build
```
Build çıktısı `dist/` klasörüne oluşturulur.

## 📝 Notlar

- Backend API URL'i `VITE_API_URL` environment variable'ından alınır
- Authentication token'lar localStorage'da saklanır
- Tüm API çağrıları `services/` klasöründe organize edilmiştir



