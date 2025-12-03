# 🚀 Quick Setup Guide

Follow these steps to get your backend running in 5 minutes!

---

## ✅ Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected output:**
```
added 150 packages in 30s
```

---

## ✅ Step 2: Create `.env` File

Copy the example file:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```bash
nano .env
# or
code .env
```

---

## ✅ Step 3: Setup MongoDB

### **Option A: MongoDB Atlas (Cloud - Recommended)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account
4. Create a FREE cluster (M0)
5. Create Database User:
   - Username: `seyda_admin`
   - Password: (generate strong password)
6. Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
7. Click "Connect" → "Connect your application"
8. Copy connection string
9. Paste in `.env` as `MONGO_URI`
10. Replace `<username>`, `<password>`, and `<database>` with your values

**Example:**
```env
MONGO_URI=mongodb+srv://seyda_admin:MyPassword123@cluster0.abc123.mongodb.net/seyda_matematik?retryWrites=true&w=majority
```

### **Option B: Local MongoDB**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

Then use:
```env
MONGO_URI=mongodb://localhost:27017/seyda_matematik
```

---

## ✅ Step 4: Setup Gmail for Email Notifications

### **Get Gmail App Password:**

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Enter "Seyda Platform Backend"
6. Click "Generate"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### **Update `.env`:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Şeyda Açıker Eğitim Platformu
ADMIN_EMAIL=seyda.aciker@gmail.com
```

---

## ✅ Step 5: Start the Server

### **Development Mode (with auto-reload):**

```bash
npm run dev
```

### **Production Mode:**

```bash
npm start
```

**Expected output:**
```
╔═══════════════════════════════════════════╗
║  🚀 Server running on port 5000           ║
║  📧 Email: seyda.aciker@gmail...          ║
║  🗄️  Database: Connected                  ║
║  🌍 Environment: development              ║
╚═══════════════════════════════════════════╝
✅ MongoDB connected successfully
✅ Email server is ready to send messages
```

---

## ✅ Step 6: Test the API

### **Test 1: Health Check**

```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected"
}
```

### **Test 2: Submit Contact Form**

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "05331234567",
    "message": "Bu bir test mesajıdır. Lütfen yanıt verin."
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Mesajınız başarıyla gönderildi!",
  "data": {
    "id": "657abc123...",
    "date": "2024-12-03T10:30:00.000Z"
  }
}
```

**Check your email** - You should receive a notification!

---

## ✅ Step 7: Update Frontend

Update your `Contact.tsx` to use the backend:

```typescript
// Replace the emailjs code with:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormStatus('sending');

  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      })
    });

    const data = await response.json();

    if (data.success) {
      setFormStatus('success');
      form.reset();
      setTimeout(() => setFormStatus('idle'), 5000);
    } else {
      setFormStatus('error');
      console.error('Validation errors:', data.errors);
    }
  } catch (error) {
    setFormStatus('error');
    console.error('Network error:', error);
  }
};
```

---

## 🎉 You're Done!

Your backend is now:
- ✅ Running on http://localhost:5000
- ✅ Connected to MongoDB
- ✅ Sending email notifications
- ✅ Validating all inputs
- ✅ Ready for production

---

## 🔧 Troubleshooting

### Problem: MongoDB connection failed

**Solution:**
```bash
# Check your MONGO_URI
# Make sure IP is whitelisted in MongoDB Atlas
# Test connection:
mongosh "your_connection_string"
```

### Problem: Email not sending

**Solution:**
```bash
# Verify Gmail App Password (not regular password)
# Check 2-Step Verification is enabled
# Test SMTP connection:
telnet smtp.gmail.com 587
```

### Problem: CORS error in frontend

**Solution:**
```env
# Update FRONTEND_URL in .env
FRONTEND_URL=http://localhost:5173
```

---

## 📚 Next Steps

1. **Add Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

2. **Add Security Headers:**
   ```bash
   npm install helmet
   ```

3. **Add Compression:**
   ```bash
   npm install compression
   ```

4. **Deploy to Production:**
   - See `README.md` for deployment instructions
   - Use Heroku, Vercel, or DigitalOcean

---

## 📞 Need Help?

- Check server logs: `npm run dev`
- Test health endpoint: `curl http://localhost:5000/api/health`
- Verify `.env` variables are correct
- Check MongoDB Atlas dashboard for connection issues

---

**Setup Time:** ~5 minutes  
**Status:** ✅ Ready to use!
