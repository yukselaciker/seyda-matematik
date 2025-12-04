/**
 * Vercel Serverless Function - Contact Form Handler
 * 
 * Endpoint: POST /api/contact
 * 
 * SECURITY FEATURES:
 * - Input validation (email regex, length limits)
 * - XSS prevention (HTML sanitization)
 * - Payload size limit
 * - Fast fail on missing fields
 * 
 * Environment Variables (set in Vercel Dashboard):
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASSWORD: Gmail App Password (16 chars, no spaces)
 * - ADMIN_EMAIL: (optional) Email to receive notifications
 */

const nodemailer = require('nodemailer');

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Validate email format using regex
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (Turkish format)
 */
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitize string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/&(?!(?:lt|gt|quot|#039);)/g, '&amp;')
    .trim();
}

/**
 * Validate input lengths
 */
const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 20,
  message: 1000
};

// Create transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send admin notification email
 */
async function sendAdminNotification({ name, email, phone, message }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  // Sanitize all inputs before using in email
  const safeName = sanitizeInput(name);
  const safeEmail = sanitizeInput(email);
  const safePhone = sanitizeInput(phone);
  const safeMessage = sanitizeInput(message);

  const mailOptions = {
    from: `"Şeyda Matematik" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 Yeni İletişim Formu - ${safeName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1C2A5E 0%, #4F46E5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #4F46E5; }
          .label { font-weight: bold; color: #1C2A5E; margin-bottom: 5px; }
          .value { color: #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 Yeni İletişim Formu</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 İsim</div>
              <div class="value">${safeName}</div>
            </div>
            <div class="field">
              <div class="label">📧 E-posta</div>
              <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
            </div>
            <div class="field">
              <div class="label">📱 Telefon</div>
              <div class="value"><a href="tel:${safePhone}">${safePhone}</a></div>
            </div>
            <div class="field">
              <div class="label">💬 Mesaj</div>
              <div class="value">${safeMessage}</div>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              Bu mesaj ${new Date().toLocaleString('tr-TR')} tarihinde web sitesi üzerinden gönderildi.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Main handler with security validations
 */
module.exports = async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // ============================================
    // SECURITY: Payload size check (fast fail)
    // ============================================
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 10000) { // 10KB max
      console.warn('⚠️ Payload too large:', contentLength);
      return res.status(413).json({
        success: false,
        message: 'İstek çok büyük.',
      });
    }

    const { name, email, phone, message } = req.body || {};

    // ============================================
    // SECURITY: Fast fail on missing fields
    // ============================================
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanları doldurunuz.',
      });
    }

    // ============================================
    // SECURITY: Type validation
    // ============================================
    if (typeof name !== 'string' || typeof email !== 'string' ||
      typeof phone !== 'string' || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri formatı.',
      });
    }

    // ============================================
    // SECURITY: Length validation
    // ============================================
    if (name.length > MAX_LENGTHS.name) {
      return res.status(400).json({
        success: false,
        message: `İsim ${MAX_LENGTHS.name} karakterden uzun olamaz.`,
      });
    }

    if (email.length > MAX_LENGTHS.email) {
      return res.status(400).json({
        success: false,
        message: `E-posta ${MAX_LENGTHS.email} karakterden uzun olamaz.`,
      });
    }

    if (phone.length > MAX_LENGTHS.phone) {
      return res.status(400).json({
        success: false,
        message: `Telefon ${MAX_LENGTHS.phone} karakterden uzun olamaz.`,
      });
    }

    if (message.length > MAX_LENGTHS.message) {
      return res.status(400).json({
        success: false,
        message: `Mesaj ${MAX_LENGTHS.message} karakterden uzun olamaz.`,
      });
    }

    // ============================================
    // SECURITY: Email format validation
    // ============================================
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz.',
      });
    }

    // ============================================
    // SECURITY: Phone format validation
    // ============================================
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir telefon numarası giriniz.',
      });
    }

    console.log(`📧 Contact form from: ${sanitizeInput(name)} <${sanitizeInput(email)}>`);

    // Send email (inputs are sanitized inside function)
    await sendAdminNotification({ name, email, phone, message });

    console.log(`✅ Email sent successfully`);

    return res.status(200).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi!',
    });

  } catch (error) {
    console.error('❌ Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
    });
  }
};
