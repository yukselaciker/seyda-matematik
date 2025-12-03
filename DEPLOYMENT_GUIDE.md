# 🚀 Deployment Guide - Vercel (Frontend) + Render (Backend)

## 📋 Environment Variables

### Vercel (Frontend) Environment Variables

Add these in **Vercel Dashboard → Project → Settings → Environment Variables**:

```
VITE_API_URL=https://seyda-matematik-api.onrender.com
```

**Note:** For local development, this is automatically set to `http://localhost:5001` by the API config.

---

### Render (Backend) Environment Variables

Add these in **Render Dashboard → Your Service → Environment**:

#### Required Variables:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
EMAIL_FROM_NAME=Şeyda Açıker
NODE_ENV=production
PORT=10000
```

#### Optional Variables:
```
ADMIN_API_KEY=your-secure-api-key-here
```

---

## 🔧 CORS Configuration

The backend (`backend/server.js`) is configured to allow requests from:

1. ✅ `http://localhost:5173` - Local development (Vite)
2. ✅ `https://seyda-matematik.vercel.app` - Production frontend

**To add a new origin:**
Edit `backend/server.js` and add to the `allowedOrigins` array:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://seyda-matematik.vercel.app',
  'https://your-custom-domain.com', // Add here
];
```

---

## 📧 Nodemailer Configuration (Fixed)

The backend uses:
- **Port:** 465 (SSL)
- **Secure:** true
- **TLS:** Enabled

This fixes the `ETIMEDOUT` errors on Render.

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASSWORD`

---

## 🏥 Health Check

Test if your Render backend is running:

```bash
curl https://seyda-matematik-api.onrender.com/
```

Expected response:
```json
{
  "success": true,
  "message": "API is running...",
  "timestamp": "2025-12-03T...",
  "environment": "production",
  "database": "connected"
}
```

---

## 🧪 Testing

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on: `http://localhost:5001`

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

3. **Test Contact Form:**
   - Open `http://localhost:5173`
   - Fill out contact form
   - Submit and check backend logs

### Production

1. **Deploy Backend to Render:**
   - Connect GitHub repository
   - Set Root Directory: `backend`
   - Add environment variables
   - Deploy

2. **Deploy Frontend to Vercel:**
   - Connect GitHub repository
   - Set Root Directory: `frontend`
   - Add `VITE_API_URL` environment variable
   - Deploy

---

## ✅ Verification Checklist

- [ ] Backend health check returns success
- [ ] CORS allows requests from Vercel domain
- [ ] Contact form submits successfully
- [ ] Email notifications are sent (check spam folder)
- [ ] Auto-reply emails are sent to users
- [ ] MongoDB connection is working
- [ ] Rate limiting is active (try 6+ requests)

---

## 🐛 Troubleshooting

### CORS Errors
- Check `allowedOrigins` array in `backend/server.js`
- Verify frontend URL matches exactly (including https/http)
- Check browser console for CORS error details

### Email Timeout Errors
- Verify `EMAIL_PORT=465` and `secure: true`
- Check Gmail App Password is correct
- Verify `EMAIL_HOST` is correct (smtp.gmail.com for Gmail)

### MongoDB Connection Errors
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Render)
- Verify database user has correct permissions

### Frontend API Errors
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend URL is accessible (health check)
- Check browser Network tab for failed requests

---

## 📞 Support

If issues persist:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Test backend health endpoint
4. Verify all environment variables are set


