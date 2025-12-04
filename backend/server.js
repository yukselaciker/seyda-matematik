/**
 * server.js - Express Server for Contact Form Backend (Render Deployment)
 * 
 * Features:
 * - MongoDB connection with Mongoose
 * - Input validation with express-validator
 * - Email notifications with Nodemailer (Port 465 SSL)
 * - CORS configuration for Vercel frontend
 * - Security best practices
 * - Error handling
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Contact = require('./models/Contact');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security headers
app.use(helmet());

// Rate limiting for contact form (5 requests per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration - Allow ONLY specific origins
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://seyda-matematik.vercel.app', // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true, // Allow cookies/session if needed
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ============================================
// NODEMAILER CONFIGURATION (Port 465 SSL)
// ============================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465, // Fixed: Use 465 for SSL (Render timeout fix)
  secure: true, // Fixed: true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Additional options for reliability
  tls: {
    rejectUnauthorized: false // Only for development, remove in production if you have valid SSL
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages (Port 465 SSL)');
  }
});

// ============================================
// VALIDATION RULES
// ============================================

const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('İsim gereklidir')
    .isLength({ min: 2, max: 100 }).withMessage('İsim 2-100 karakter arasında olmalıdır')
    .escape(),

  body('email')
    .trim()
    .notEmpty().withMessage('E-posta gereklidir')
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Telefon numarası gereklidir')
    .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Geçerli bir telefon numarası giriniz'),

  body('message')
    .trim()
    .notEmpty().withMessage('Mesaj gereklidir')
    .isLength({ min: 10, max: 1000 }).withMessage('Mesaj 10-1000 karakter arasında olmalıdır')
    .escape()
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Send email notification to admin
 */
async function sendEmailNotification(contactData) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 Yeni İletişim Formu Mesajı - ${contactData.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1C2A5E 0%, #4F46E5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #1C2A5E; margin-bottom: 5px; }
          .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📩 Yeni İletişim Formu Mesajı</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Şeyda Açıker Eğitim Platformu</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 İsim Soyisim:</div>
              <div class="value">${contactData.name}</div>
            </div>
            <div class="field">
              <div class="label">📧 E-posta:</div>
              <div class="value">${contactData.email}</div>
            </div>
            <div class="field">
              <div class="label">📱 Telefon:</div>
              <div class="value">${contactData.phone}</div>
            </div>
            <div class="field">
              <div class="label">💬 Mesaj:</div>
              <div class="value" style="white-space: pre-wrap;">${contactData.message}</div>
            </div>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send auto-reply email to the user
 */
async function sendAutoReply(contactData) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: contactData.email,
    subject: `Mesajınız Alındı - Şeyda Açıker Eğitim Platformu`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #4F46E5 0%, #4338ca 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; background: white; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Mesajınız Bize Ulaştı! 🎉</h1>
          </div>
          <div class="content">
            <p>Merhaba <strong>${contactData.name}</strong>,</p>
            <p>Mesajınız başarıyla sistemimize kaydedildi ve tarafıma iletildi.</p>
            <p>En kısa sürede size dönüş yapacağım.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Şeyda Açıker Eğitim Platformu</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

// ============================================
// API ROUTES
// ============================================

/**
 * GET / - Health Check Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running...',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

/**
 * POST /api/contact
 * Submit contact form
 */
app.post('/api/contact', contactLimiter, contactValidationRules, async (req, res) => {
  try {
    // 1. VALIDATE INPUT
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    // 2. EXTRACT DATA
    const { name, email, phone, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // 3. SAVE TO DATABASE
    const contact = new Contact({
      name,
      email,
      phone,
      message,
      ipAddress
    });

    await contact.save();
    console.log(`✅ Contact saved to DB: ${contact._id}`);

    // 4. SEND EMAIL NOTIFICATIONS (Parallel)
    try {
      await Promise.all([
        sendEmailNotification({ name, email, phone, message }),
        sendAutoReply({ name, email, phone, message })
      ]);
      
      console.log(`✅ Emails sent (Admin + Auto-reply)`);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('⚠️ Email send failed (but contact saved):', emailError.message);
      
      contact.status = 'email_failed';
      await contact.save();
    }

    // 5. RETURN SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
      data: {
        id: contact._id,
        date: contact.date
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🚀 Server running on port ${PORT}         ║
║  📧 Email: ${process.env.ADMIN_EMAIL?.substring(0, 20)}...  ║
║  🗄️  Database: Connected                  ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}           ║
║  🔒 CORS: Enabled for allowed origins      ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  mongoose.connection.close();
  process.exit(0);
});




