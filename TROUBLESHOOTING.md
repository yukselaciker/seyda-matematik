# 🔧 Sorun Giderme Kılavuzu

## ❌ "Sunucuya bağlanırken hata" Hatası

### 📋 Kontrol Listesi

1. **Backend çalışıyor mu?**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Beklenen: `{"success": true, ...}`

2. **Frontend çalışıyor mu?**
   - Tarayıcıda: http://localhost:3001
   - Terminal'de: `npm run dev` çıktısı var mı?

3. **Network Tab kontrolü:**
   - F12 → Network sekmesi
   - Formu gönder
   - `/api/contact` isteğine tıkla

---

## 🔍 Senaryo 1: Request URL = `localhost:5000` (YANLIŞ PORT)

### Göreceğin:
```
Request URL: http://localhost:5000/api/contact
Status: (failed) - Kırmızı
```

### Sebep:
Tarayıcı **eski JavaScript dosyasını** cache'lemiş.

### Çözüm A - Vite Cache Temizle (GARANTİLİ):
```bash
# Frontend'i durdur (Ctrl + C)

# Cache'i temizle
rm -rf node_modules/.vite

# Yeniden başlat
npm run dev
```

### Çözüm B - Tarayıcı Cache Temizle:
1. Tarayıcıyı **tamamen kapat**
2. Yeniden aç
3. http://localhost:3001 adresine git

### Çözüm C - Hard Refresh:
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### Çözüm D - Incognito Mode (Test için):
```
Mac: Cmd + Shift + N
Windows: Ctrl + Shift + N
```

---

## 🔍 Senaryo 2: Request URL = `localhost:5001` + CORS Error

### Göreceğin:
```
Request URL: http://localhost:5001/api/contact
Status: CORS policy error - Kırmızı
```

### Sebep:
Backend, frontend'in portuna (3001) izin vermiyor.

### Çözüm:
Backend'de CORS zaten var ama port yanlış olabilir.

**Kontrol Et:**
`backend/server.js` dosyasında:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',  // ✅ 3001 olmalı
  credentials: true
}));
```

Eğer `5173` veya başka bir port yazıyorsa `3001` yap.

**Backend'i yeniden başlat:**
```bash
cd backend
npm run dev
```

---

## 🔍 Senaryo 3: Status = 200 OK (BAŞARILI!)

### Göreceğin:
```
Request URL: http://localhost:5001/api/contact
Status: 200 OK - Yeşil
Response: {"success": true, "message": "Contact saved successfully", ...}
```

### 🎉 Tebrikler!
Mesaj başarıyla gönderildi.

**Kontrol Et:**
1. **Backend Terminal:**
   ```
   ✅ Contact saved to DB: 657abc...
   ✅ Email sent to admin: seyda.aciker@gmail.com
   ```

2. **MongoDB:**
   - Atlas Dashboard → Collections → `contacts`
   - Yeni kayıt görünmeli

3. **Email:**
   - Admin email kutusunu kontrol et
   - Spam klasörüne de bak

---

## 🚨 Diğer Yaygın Hatalar

### Hata: "MongoServerError: bad auth"

**Sebep:** MongoDB şifresi yanlış

**Çözüm:**
1. `backend/.env` dosyasını aç
2. `MONGO_URI` içindeki şifreyi kontrol et
3. MongoDB Atlas'ta şifreyi sıfırla
4. Özel karakterler varsa URL encode et:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`

### Hata: "Email not sent"

**Sebep:** Gmail App Password yanlış veya yok

**Çözüm:**
1. Gmail'de 2 Adımlı Doğrulama açık mı kontrol et
2. App Password oluştur: https://myaccount.google.com/apppasswords
3. `backend/.env` dosyasında:
   ```env
   EMAIL_USER=seyda.aciker@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16 haneli App Password
   ```

### Hata: "Port 5001 already in use"

**Sebep:** Eski backend process'i hâlâ çalışıyor

**Çözüm:**
```bash
# Port 5001'i kullanan process'i bul ve kapat
lsof -ti:5001 | xargs kill -9

# Backend'i yeniden başlat
cd backend
npm run dev
```

---

## ✅ Başarılı Kurulum Kontrol Listesi

### Backend:
- [ ] `backend/.env` dosyası dolduruldu
- [ ] MongoDB bağlantısı çalışıyor
- [ ] Email ayarları doğru
- [ ] Backend port 5001'de çalışıyor
- [ ] CORS origin = `http://localhost:3001`

### Frontend:
- [ ] `.env` dosyası oluşturuldu (opsiyonel)
- [ ] EmailJS bağımlılığı kaldırıldı
- [ ] API_URL = `http://localhost:5001`
- [ ] Frontend port 3001'de çalışıyor
- [ ] Vite cache temizlendi

### Test:
- [ ] İletişim formu çalışıyor
- [ ] Demo ders talebi çalışıyor
- [ ] Network tab'da Status 200 OK
- [ ] Backend'de log görünüyor
- [ ] MongoDB'de kayıt var
- [ ] Admin email'e bildirim geldi

---

## 📞 Hâlâ Sorun mu Var?

### Debug Bilgileri Topla:

1. **Network Tab Screenshot:**
   - F12 → Network
   - `/api/contact` isteğine tıkla
   - Request URL, Status, Response'u göster

2. **Backend Terminal Output:**
   - Son 20 satırı kopyala

3. **Frontend Console Errors:**
   - F12 → Console
   - Kırmızı hataları kopyala

4. **Environment Check:**
   ```bash
   # Backend port
   lsof -i:5001
   
   # Frontend port
   lsof -i:3001
   
   # MongoDB connection
   curl http://localhost:5001/api/health
   ```

Bu bilgilerle sorunu çok daha hızlı çözebiliriz!

---

## 🎯 Hızlı Çözüm Özeti

**Problem:** Form gönderilmiyor  
**Çözüm:** 
1. Vite cache'i temizle: `rm -rf node_modules/.vite`
2. Frontend'i yeniden başlat: `npm run dev`
3. Tarayıcıyı kapat/aç
4. Test et

**Problem:** CORS hatası  
**Çözüm:**
1. `backend/server.js` → CORS origin = `http://localhost:3001`
2. Backend'i yeniden başlat

**Problem:** MongoDB bağlanamıyor  
**Çözüm:**
1. `backend/.env` → MONGO_URI kontrol et
2. MongoDB Atlas → IP whitelist `0.0.0.0/0`
3. Şifre özel karakter içeriyorsa URL encode et

**Problem:** Email gönderilmiyor  
**Çözüm:**
1. Gmail → 2 Adımlı Doğrulama aç
2. App Password oluştur
3. `backend/.env` → EMAIL_PASSWORD güncelle
