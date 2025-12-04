# 🚀 Vercel'de Frontend Klasörünü Görme ve Deploy Etme Rehberi

## ✅ Adım 1: Git'e Commit ve Push

Eğer frontend klasörü git'te görünmüyorsa:

```bash
# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "feat: Frontend klasörü oluşturuldu"

# Push yap
git push origin main
```

---

## 🎯 Adım 2: Vercel'de Root Directory Ayarlama

### Yöntem 1: Yeni Proje Oluştururken

1. **Vercel Dashboard'a Git:**
   - https://vercel.com → "Add New Project"

2. **Repository Seç:**
   - GitHub/GitLab/Bitbucket repository'nizi seçin

3. **Framework Preset:**
   - **Vite** seçin (otomatik algılanabilir)

4. **Root Directory Ayarla:**
   - ⚠️ **ÖNEMLİ:** "Root Directory" alanına `frontend` yazın
   - Veya yanındaki "Edit" butonuna tıklayıp `frontend` seçin

5. **Build Settings (Otomatik olmalı):**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Environment Variables Ekle:**
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_ADMIN_API_KEY=your-admin-api-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

7. **Deploy Et:**
   - "Deploy" butonuna tıklayın

---

### Yöntem 2: Mevcut Projede Root Directory Değiştirme

Eğer proje zaten Vercel'de varsa:

1. **Vercel Dashboard → Projenize Git**

2. **Settings → General**

3. **Root Directory:**
   - "Edit" butonuna tıklayın
   - `frontend` yazın veya seçin
   - "Save" butonuna tıklayın

4. **Redeploy:**
   - "Deployments" sekmesine gidin
   - En son deployment'ın yanındaki "..." menüsünden
   - "Redeploy" seçin

---

## 🔍 Frontend Klasörünün Git'te Görünmemesi

### Kontrol Et:

```bash
# Git durumunu kontrol et
git status

# Frontend klasörünü gör
git ls-files | grep frontend

# Eğer görünmüyorsa, ekle
git add frontend/
git commit -m "feat: Frontend klasörü eklendi"
git push
```

### .gitignore Kontrolü:

`.gitignore` dosyasında `frontend/` yazıyorsa, bu klasör ignore edilir. Kontrol edin:

```bash
cat .gitignore | grep frontend
```

Eğer `frontend/` ignore ediliyorsa, `.gitignore` dosyasından kaldırın.

---

## 📁 Vercel'de Klasör Yapısı

Vercel şu yapıyı görmeli:

```
your-repo/
├── frontend/          ← Vercel buraya bakmalı
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── src/
│   └── ...
└── backend/           ← Backend ayrı deploy edilir
```

---

## ⚙️ Vercel.json Yapılandırması

`frontend/vercel.json` dosyası zaten oluşturuldu:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Bu dosya Vercel'in projeyi doğru şekilde build etmesini sağlar.

---

## 🐛 Sorun Giderme

### Problem: "Frontend klasörü görünmüyor"

**Çözüm 1: Git'e ekle**
```bash
git add frontend/
git commit -m "feat: Frontend klasörü eklendi"
git push
```

**Çözüm 2: .gitignore kontrolü**
```bash
# .gitignore'da frontend/ var mı kontrol et
grep -n "frontend" .gitignore

# Varsa kaldır
```

**Çözüm 3: Vercel'de Root Directory ayarla**
- Vercel Dashboard → Settings → General
- Root Directory: `frontend` olarak ayarla

---

### Problem: "Build hatası"

**Çözüm:**
```bash
# Local'de test et
cd frontend
npm install
npm run build

# Hataları kontrol et ve düzelt
```

---

### Problem: "Environment variables çalışmıyor"

**Çözüm:**
- Vercel Dashboard → Settings → Environment Variables
- `VITE_` prefix'i ile başladığından emin olun
- Redeploy yapın

---

## ✅ Kontrol Listesi

- [ ] Frontend klasörü git'te var mı? (`git ls-files | grep frontend`)
- [ ] Commit ve push yapıldı mı?
- [ ] Vercel'de Root Directory: `frontend` olarak ayarlandı mı?
- [ ] Environment variables eklendi mi?
- [ ] Build başarılı mı?
- [ ] Site çalışıyor mu?

---

## 🎉 Başarılı Deploy Sonrası

1. Vercel size bir URL verecek: `https://your-project.vercel.app`
2. Site çalışıyor mu kontrol edin
3. API bağlantılarını test edin
4. Custom domain ekleyebilirsiniz

---

**Sorun devam ederse:** Vercel Dashboard → Deployments → En son deployment'ın loglarını kontrol edin.





