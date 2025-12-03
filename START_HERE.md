# 🚀 Quick Start Guide

## Complete Setup in 3 Steps!

---

## ✅ Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
# or
code .env
```

**Required in `.env`:**
```env
MONGO_URI=mongodb+srv://your_username:password@cluster.mongodb.net/database
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=seyda.aciker@gmail.com
```

**Get MongoDB URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate password for "Mail"
3. Copy 16-character password

---

## ✅ Step 2: Start Backend

```bash
# In backend directory
npm run dev
```

**Expected output:**
```
╔═══════════════════════════════════════════╗
║  🚀 Server running on port 5000           ║
║  📧 Email: seyda.aciker@gmail...          ║
║  🗄️  Database: Connected                  ║
╚═══════════════════════════════════════════╝
✅ MongoDB connected successfully
✅ Email server is ready to send messages
```

**Test backend:**
```bash
# In a new terminal
curl http://localhost:5000/api/health
```

---

## ✅ Step 3: Start Frontend

```bash
# In project root (new terminal)
npm run dev
# or
npm start
```

**Open browser:**
```
http://localhost:5173
```

---

## 🧪 Test Contact Form

1. **Go to contact section** on your website
2. **Fill out the form:**
   - Name: Test User
   - Email: test@example.com
   - Phone: 0533 123 4567
   - Message: Bu bir test mesajıdır
3. **Click "Mesajı Gönder"**
4. **Check:**
   - ✅ Success message appears
   - ✅ Admin email received
   - ✅ Data in MongoDB

---

## 📊 What You Should See

### **Frontend:**
```
✅ Contact form loads
✅ Submit button works
✅ Loading spinner shows
✅ Success message appears
✅ Form resets after 5 seconds
```

### **Backend Console:**
```
✅ Contact saved to DB: 657abc123...
✅ Email sent to admin: seyda.aciker@gmail.com
```

### **Admin Email:**
```
📩 Yeni İletişim Formu Mesajı
Şeyda Açıker Eğitim Platformu

[YENİ MESAJ] 3 Aralık 2024, 13:30

👤 İsim: Test User
📧 E-posta: test@example.com
📱 Telefon: 0533 123 4567
💬 Mesaj: Bu bir test mesajıdır
```

---

## 🐛 Troubleshooting

### **Backend won't start:**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Try again
npm run dev
```

### **MongoDB connection error:**
```bash
# Check MONGO_URI in .env
# Verify IP is whitelisted in MongoDB Atlas
# Test connection:
mongosh "your_connection_string"
```

### **Email not sending:**
```bash
# Use App Password (not regular Gmail password)
# Enable 2-Step Verification first
# Check EMAIL_USER and EMAIL_PASSWORD in .env
```

### **CORS error:**
```bash
# Check FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:5173

# Restart backend
```

---

## 📚 Documentation

- **Backend Setup:** `backend/SETUP.md`
- **Backend API:** `backend/README.md`
- **Integration Guide:** `FRONTEND_BACKEND_INTEGRATION.md`
- **Implementation Summary:** `BACKEND_IMPLEMENTATION.md`

---

## 🎯 Quick Commands

### **Start Everything:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### **Test Backend:**
```bash
# Health check
curl http://localhost:5000/api/health

# Test contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "phone": "05331234567",
    "message": "Test message"
  }'
```

### **View Contacts:**
```bash
curl http://localhost:5000/api/contacts
```

---

## ✅ Checklist

**Before Starting:**
- [ ] Node.js installed (v16+)
- [ ] MongoDB Atlas account created
- [ ] Gmail App Password generated
- [ ] Dependencies installed (`npm install`)

**Backend Setup:**
- [ ] `.env` file created
- [ ] MongoDB URI configured
- [ ] Email credentials configured
- [ ] Backend starts successfully
- [ ] Health check passes

**Frontend Setup:**
- [ ] Frontend starts successfully
- [ ] Contact form visible
- [ ] Form submits without errors

**Testing:**
- [ ] Form submission works
- [ ] Success message appears
- [ ] Admin receives email
- [ ] Data saved to MongoDB

---

## 🚀 You're Ready!

Once all checkboxes are ✅, your system is fully operational!

**What works:**
- ✅ Contact form on website
- ✅ Backend API validation
- ✅ MongoDB data storage
- ✅ Email notifications
- ✅ Admin dashboard endpoints

**Next steps:**
- Deploy to production
- Add rate limiting
- Setup monitoring
- Create admin panel

---

**Need Help?**
- Check documentation files
- Review backend logs
- Test with curl commands
- Verify environment variables

**Status:** 🎉 **Ready to Use!**
