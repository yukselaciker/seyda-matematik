# 🚀 Vercel Deployment Guide

## 📁 Proje Yapısı

Proje artık frontend ve backend olarak ayrılmıştır:

```
şeyda-matematik---özel-ders/
├── frontend/          # Frontend (Vite + React)
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json    # Vercel yapılandırması
└── backend/           # Backend (Express + MongoDB)
    ├── models/
    ├── server.js
    └── package.json
```

---

## 🎯 Vercel'de Frontend Deploy Etme

### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel'e Git:**
   - https://vercel.com adresine gidin
   - GitHub/GitLab/Bitbucket ile giriş yapın

2. **Yeni Proje Ekle:**
   - "Add New Project" butonuna tıklayın
   - Repository'nizi seçin

3. **Yapılandırma:**
   - **Framework Preset:** Vite (otomatik algılanır)
   - **Root Directory:** `frontend` seçin ⚠️ ÖNEMLİ
   - **Build Command:** `npm run build` (otomatik)
   - **Output Directory:** `dist` (otomatik)
   - **Install Command:** `npm install` (otomatik)

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_ADMIN_API_KEY=your-admin-api-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Deploy:**
   - "Deploy" butonuna tıklayın

---

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Frontend klasörüne gidin
cd frontend

# Deploy edin
vercel

# Production deploy için
vercel --prod
```

**Not:** CLI kullanırken, `frontend` klasöründe olduğunuzdan emin olun.

---

## ⚙️ Vercel Yapılandırması

`frontend/vercel.json` dosyası otomatik olarak:
- ✅ SPA routing'i yönetir (tüm route'lar `/index.html`'e yönlendirilir)
- ✅ Security headers ekler
- ✅ Build ve output ayarlarını yapılandırır

---

## 🔧 Environment Variables

Vercel Dashboard'da şu environment variable'ları ekleyin:

### Frontend Variables (VITE_ prefix ile):
```
VITE_API_URL=https://your-backend-api.vercel.app
VITE_ADMIN_API_KEY=your-admin-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Önemli:** Vite'da environment variable'lar `VITE_` prefix'i ile başlamalıdır.

---

## 📝 Build Ayarları

Vercel otomatik olarak algılar:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

---

## 🌐 Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Domain'inizi ekleyin
3. DNS kayıtlarını yapılandırın

---

## 🔄 Continuous Deployment

Vercel otomatik olarak:
- ✅ Her `git push` sonrası deploy yapar
- ✅ Preview deployments oluşturur (PR'lar için)
- ✅ Production deployments için manuel onay isteyebilirsiniz

---

## 🐛 Troubleshooting

### Build Hatası
```bash
# Local'de test edin
cd frontend
npm install
npm run build
```

### Environment Variables Çalışmıyor
- `VITE_` prefix'ini kontrol edin
- Vercel Dashboard'da değişkenleri yeniden ekleyin
- Redeploy yapın

### Routing Sorunları
- `vercel.json` dosyasının `rewrites` kısmını kontrol edin
- Tüm route'lar `/index.html`'e yönlendirilmeli

### API Bağlantı Sorunları
- Backend URL'ini kontrol edin
- CORS ayarlarını backend'de kontrol edin
- Environment variable'ları kontrol edin

---

## 📦 Backend Deployment

Backend'i ayrı bir Vercel projesi olarak deploy edebilirsiniz:

1. Yeni bir Vercel projesi oluşturun
2. Root Directory: `backend` seçin
3. Build Command: (boş bırakın veya `echo "No build needed"`)
4. Output Directory: (boş bırakın)
5. Environment Variables ekleyin:
   ```
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   ADMIN_API_KEY=your-admin-api-key
   EMAIL_HOST=your-email-host
   EMAIL_PORT=465
   EMAIL_USER=your-email
   EMAIL_PASSWORD=your-password
   ADMIN_EMAIL=admin@example.com
   ```

---

## ✅ Deployment Checklist

- [ ] Frontend klasörü oluşturuldu
- [ ] Tüm frontend dosyaları taşındı
- [ ] `frontend/vercel.json` oluşturuldu
- [ ] Environment variables eklendi
- [ ] Root Directory: `frontend` olarak ayarlandı
- [ ] Build test edildi (`npm run build`)
- [ ] Deploy edildi
- [ ] Custom domain yapılandırıldı (opsiyonel)

---

## 🎉 Başarılı Deploy Sonrası

1. Site URL'inizi kontrol edin
2. API bağlantılarını test edin
3. Authentication flow'unu test edin
4. Admin panel'i test edin

---

**Sorularınız için:** Vercel dokümantasyonuna bakın: https://vercel.com/docs


