/**
 * server.js - Express Server for Contact Form Backend
 * 
 * Features:
 * - MongoDB connection with Mongoose
 * - Input validation with express-validator
 * - Email notifications with Nodemailer
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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Contact = require('./models/Contact');
const User = require('./models/User');

// Initialize Express app
const app = express();

// ============================================
// PROXY & MIDDLEWARE CONFIGURATION
// ============================================

// Trust proxy - REQUIRED for Render/Vercel/Heroku
// Fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR from express-rate-limit
app.set('trust proxy', 1);

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

// ============================================
// CORS CONFIGURATION
// ============================================
// Allowed origins for CORS (local development + production)
const allowedOrigins = [
  'http://localhost:5173',           // Vite dev server (default)
  'http://localhost:3000',           // Alternative local port
  'http://localhost:3001',           // Alternative local port
  'https://seyda-matematik.vercel.app', // Production frontend on Vercel
  process.env.FRONTEND_URL           // Custom frontend URL from env
].filter(Boolean); // Remove undefined/null values

// Regex pattern to match Vercel preview deployments
// Matches: https://seyda-matematik-*-furkanyuksels-projects.vercel.app
const vercelPreviewPattern = /^https:\/\/seyda-matematik(-[a-z0-9]+)?(-[a-z0-9-]+)?\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check exact match in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if it's a Vercel preview deployment
    if (vercelPreviewPattern.test(origin)) {
      console.log(`✅ CORS allowed Vercel preview: ${origin}`);
      return callback(null, true);
    }
    
    // Also allow any *.vercel.app subdomain for flexibility
    if (origin.endsWith('.vercel.app')) {
      console.log(`✅ CORS allowed Vercel domain: ${origin}`);
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked request from: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// JWT Token generation helper
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// Authentication middleware - supports both Bearer token and API Key
const authMiddleware = (req, res, next) => {
  try {
    // Check for Bearer token first
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to API Key for backward compatibility
      const apiKey = req.headers['x-api-key'];
      if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
        // API Key is valid, proceed
        req.user = { role: 'admin' }; // Set default admin role for API key
        return next();
      }
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz erişim. Token veya API anahtarı gerekli.'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş. Lütfen tekrar giriş yapın.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme hatası.'
    });
  }
};

// Admin-only middleware (requires admin role)
const adminAuth = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gereklidir.'
      });
    }
  });
};

// ============================================
// DATABASE CONNECTION
// ============================================
// Debug logs removed for production security

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ============================================
// NODEMAILER CONFIGURATION
// ============================================
// Using Gmail service shorthand - handles host/port/secure automatically
// This is more reliable than manual SMTP configuration on cloud platforms

const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail service shorthand - auto-configures host, port, secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
  },
  tls: {
    rejectUnauthorized: false // Required for some cloud providers
  }
});

// Verify email configuration on startup (non-blocking)
transporter.verify()
  .then(() => {
    console.log('✅ Email server is ready to send messages');
    console.log('   Service: Gmail');
    console.log('   User:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'NOT SET');
  })
  .catch((error) => {
    console.error('❌ Email configuration error:', error.message);
    console.error('   Service: Gmail');
    console.error('   User:', process.env.EMAIL_USER ? '***configured***' : 'NOT SET');
    console.error('   Pass:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
    console.error('   Tip: Make sure you are using a Gmail App Password, not your regular password');
  });

// ============================================
// VALIDATION RULES
// ============================================

const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('İsim gereklidir')
    .isLength({ min: 2, max: 100 }).withMessage('İsim 2-100 karakter arasında olmalıdır')
    .escape(), // Sanitize against XSS

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
          .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📩 Yeni İletişim Formu Mesajı</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Şeyda Açıker Eğitim Platformu</p>
          </div>
          <div class="content">
            <div style="margin-bottom: 20px;">
              <span class="badge">YENİ MESAJ</span>
              <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">
                ${new Date().toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div class="field">
              <div class="label">👤 İsim Soyisim:</div>
              <div class="value">${contactData.name}</div>
            </div>

            <div class="field">
              <div class="label">📧 E-posta:</div>
              <div class="value">
                <a href="mailto:${contactData.email}" style="color: #4F46E5; text-decoration: none;">
                  ${contactData.email}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="label">📱 Telefon:</div>
              <div class="value">
                <a href="tel:${contactData.phone}" style="color: #4F46E5; text-decoration: none;">
                  ${contactData.phone}
                </a>
              </div>
            </div>

            <div class="field">
              <div class="label">💬 Mesaj:</div>
              <div class="value" style="white-space: pre-wrap;">${contactData.message}</div>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-left: 4px solid #4F46E5; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>Hızlı Yanıt:</strong> WhatsApp üzerinden 2 saat içinde yanıt vermeyi unutmayın!
              </p>
            </div>
          </div>
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            <p>Şeyda Açıker Matematik Özel Ders © ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Yeni İletişim Formu Mesajı

İsim: ${contactData.name}
E-posta: ${contactData.email}
Telefon: ${contactData.phone}

Mesaj:
${contactData.message}

Tarih: ${new Date().toLocaleString('tr-TR')}
    `
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
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .highlight { color: #4F46E5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Mesajınız Bize Ulaştı! 🎉</h1>
          </div>
          <div class="content">
            <p>Merhaba <strong>${contactData.name}</strong>,</p>
            <p>Şeyda Açıker Eğitim Platformu ile iletişime geçtiğiniz için teşekkür ederim. Mesajınız başarıyla sistemimize kaydedildi ve tarafıma iletildi.</p>
            
            <div style="background: #eff6ff; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-style: italic;">"${contactData.message}"</p>
            </div>

            <p>Mesajınızı en kısa sürede inceleyip size <strong>${contactData.phone}</strong> numaralı telefonunuzdan veya bu e-posta adresi üzerinden dönüş yapacağım.</p>
            
            <p>Bu süreçte sitemizdeki kaynakları inceleyebilir veya acil durumlarda aşağıdaki butondan WhatsApp üzerinden ulaşabilirsiniz.</p>

            <div style="text-align: center;">
              <a href="https://wa.me/905057652071" class="button">WhatsApp'tan Ulaşın</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Şeyda Açıker Eğitim Platformu</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register new user
 */
app.post('/api/auth/register', [
  body('email')
    .trim()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Ad soyad 2-100 karakter arasında olmalıdır')
], async (req, res) => {
  try {
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

    const { email, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresiyle zaten bir hesap mevcut.'
      });
    }

    // Create new user (default role: student)
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      full_name,
      role: 'student'
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı!',
      data: {
        user: newUser.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/api/auth/login', [
  body('email')
    .trim()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
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

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// API ROUTES
// ============================================

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
      // Send admin notification AND user auto-reply
      await Promise.all([
        sendEmailNotification({ name, email, phone, message }),
        sendAutoReply({ name, email, phone, message })
      ]);
      
      console.log(`✅ Emails sent (Admin + Auto-reply)`);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('⚠️ Email send failed (but contact saved):', emailError.message);
      
      // Optionally, you could mark this contact for manual follow-up
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
    // Detailed error logging for debugging
    console.error('❌ Contact form error:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
    
    // Log Mongoose validation errors in detail
    if (error.name === 'ValidationError') {
      console.error('   Validation errors:');
      Object.keys(error.errors || {}).forEach(field => {
        console.error(`     - ${field}: ${error.errors[field].message}`);
      });
    }
    
    // Log full error object for debugging
    try {
      console.error('   Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (e) {
      console.error('   Could not stringify error');
    }
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/contacts (ADMIN ONLY - Protected with Bearer Token or API Key)
 * Retrieve all contact submissions
 */
app.get('/api/contacts', adminAuth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const contacts = await Contact.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

/**
 * PATCH /api/contacts/:id/status (ADMIN ONLY - Protected with Bearer Token or API Key)
 * Update contact status
 */
app.patch('/api/contacts/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum değeri'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'İletişim kaydı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/admin/users (ADMIN ONLY)
 * List all registered users
 */
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const { role, limit = 100, page = 1 } = req.query;
    
    const query = role ? { role } : {};
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password -__v');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken hata oluştu.'
    });
  }
});

/**
 * DELETE /api/admin/users/:id (ADMIN ONLY)
 * Delete a user
 */
app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi.',
      data: { id }
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu.'
    });
  }
});

/**
 * PATCH /api/admin/users/:id/role (ADMIN ONLY)
 * Update user role
 */
app.patch('/api/admin/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'parent', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz rol değeri.'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı rolü güncellendi.',
      data: user
    });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Rol güncellenirken hata oluştu.'
    });
  }
});

/**
 * DELETE /api/contacts/:id (ADMIN ONLY)
 * Delete a contact message
 */
app.delete('/api/contacts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mesaj başarıyla silindi.',
      data: { id }
    });
  } catch (error) {
    console.error('❌ Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj silinirken hata oluştu.'
    });
  }
});

/**
 * GET /api/admin/stats (ADMIN ONLY)
 * Get dashboard statistics
 */
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalContacts, newContacts] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' })
    ]);

    // Count by role
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalContacts,
        newContacts,
        studentCount,
        teacherCount
      }
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu.'
    });
  }
});

/**
 * Root health check endpoint - Simple ping for Render/uptime monitoring
 * GET / returns "API is running..." for easy server status check
 */
app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

/**
 * Detailed health check endpoint
 * GET /api/health returns JSON with server status details
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🚀 Server running on port ${PORT}         ║
║  📧 Email: ${process.env.ADMIN_EMAIL?.substring(0, 20)}...  ║
║  🗄️  Database: Connected                  ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  mongoose.connection.close();
  process.exit(0);
});
