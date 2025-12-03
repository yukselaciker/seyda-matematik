# 🚀 Contact Form Backend API

Complete backend solution for Şeyda Açıker Teaching Platform contact form.

## 📋 Features

- ✅ **Input Validation** with express-validator
- ✅ **MongoDB Storage** with Mongoose
- ✅ **Email Notifications** with Nodemailer
- ✅ **Security** with environment variables
- ✅ **Error Handling** with graceful fallbacks
- ✅ **CORS Support** for frontend integration
- ✅ **Admin Dashboard** endpoints

---

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/seyda_matematik
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
ADMIN_EMAIL=seyda.aciker@gmail.com
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📧 Gmail Setup

To use Gmail with Nodemailer:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate a password for "Mail"
5. Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

---

## 🔌 API Endpoints

### **POST** `/api/contact`
Submit a contact form message.

**Request Body:**
```json
{
  "name": "Ayşe Yılmaz",
  "email": "ayse@example.com",
  "phone": "0533 765 20 71",
  "message": "8. sınıf öğrencim için LGS hazırlık dersi almak istiyorum."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mesajınız başarıyla gönderildi!",
  "data": {
    "id": "657abc123def456789",
    "date": "2024-12-03T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    {
      "field": "email",
      "message": "Geçerli bir e-posta adresi giriniz"
    }
  ]
}
```

---

### **GET** `/api/contacts`
Retrieve all contact submissions (Admin only).

**Query Parameters:**
- `status` (optional): Filter by status (new, read, replied)
- `limit` (optional): Number of results per page (default: 50)
- `page` (optional): Page number (default: 1)

**Example:**
```
GET /api/contacts?status=new&limit=20&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "657abc123def456789",
      "name": "Ayşe Yılmaz",
      "email": "ayse@example.com",
      "phone": "0533 765 20 71",
      "message": "LGS hazırlık dersi...",
      "status": "new",
      "date": "2024-12-03T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

---

### **PATCH** `/api/contacts/:id/status`
Update contact status (Admin only).

**Request Body:**
```json
{
  "status": "read"
}
```

**Valid statuses:** `new`, `read`, `replied`

---

### **GET** `/api/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-03T10:30:00.000Z",
  "database": "connected"
}
```

---

## 🔗 Frontend Integration

Update your `Contact.tsx` component to use the backend API:

```typescript
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
      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
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

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<database>` in the connection string

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use local connection string
MONGO_URI=mongodb://localhost:27017/seyda_matematik
```

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Input validation and sanitization
- XSS protection with `.escape()`
- Environment variables for credentials
- CORS configuration
- Error handling without exposing internals
- IP address logging

🔜 **Recommended for Production:**

```bash
# Install additional security packages
npm install helmet express-rate-limit compression
```

Add to `server.js`:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.'
});

app.use('/api/contact', limiter);
```

---

## 🧪 Testing

### Using cURL:

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "05331234567",
    "message": "Bu bir test mesajıdır."
  }'
```

### Using Postman:

1. Method: `POST`
2. URL: `http://localhost:5000/api/contact`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "Ayşe Yılmaz",
  "email": "ayse@example.com",
  "phone": "0533 765 20 71",
  "message": "8. sınıf öğrencim için LGS hazırlık dersi almak istiyorum."
}
```

---

## 📊 Database Schema

```javascript
{
  name: String (2-100 chars, required),
  email: String (valid email, indexed, required),
  phone: String (valid phone, required),
  message: String (10-1000 chars, required),
  date: Date (default: now, indexed),
  status: String (enum: new/read/replied, default: new),
  ipAddress: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🚀 Deployment

### Deploy to Heroku:

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create seyda-matematik-api

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_password
heroku config:set ADMIN_EMAIL=admin@example.com

# Deploy
git push heroku main
```

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | `your@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM_NAME` | Sender name | `Şeyda Açıker Platform` |
| `ADMIN_EMAIL` | Admin email for notifications | `seyda.aciker@gmail.com` |

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED
```

**Solution:** Check your `MONGO_URI` and ensure MongoDB is running.

### Email Not Sending

```
Error: Invalid login
```

**Solution:** 
- Use App Password (not regular Gmail password)
- Enable 2-Step Verification
- Check EMAIL_USER and EMAIL_PASSWORD

### CORS Error

```
Access to fetch blocked by CORS policy
```

**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL.

---

## 📞 Support

For issues or questions:
- Check the logs: `npm run dev`
- Test with `/api/health` endpoint
- Verify environment variables
- Check MongoDB connection

---

## 📄 License

MIT License - Feel free to use this for your projects!

---

**Created for:** Şeyda Açıker Eğitim Platformu  
**Date:** December 2024  
**Status:** ✅ Production Ready
