/**
 * Vercel Serverless Function - Contact Form Handler
 * 
 * Endpoint: POST /api/contact
 * 
 * This function handles contact form submissions and sends email notifications
 * using Nodemailer with Gmail service.
 * 
 * Environment Variables Required:
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASSWORD: Gmail App Password (not regular password)
 * - ADMIN_EMAIL: Email to receive notifications (optional, defaults to EMAIL_USER)
 */

const nodemailer = require('nodemailer');

// Create reusable transporter with connection pooling
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Validate request body
 */
function validateBody(body) {
  const errors = [];
  
  if (!body.name || body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'İsim en az 2 karakter olmalıdır' });
  }
  
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push({ field: 'email', message: 'Geçerli bir e-posta adresi giriniz' });
  }
  
  if (!body.phone || body.phone.trim().length < 5) {
    errors.push({ field: 'phone', message: 'Geçerli bir telefon numarası giriniz' });
  }
  
  if (!body.message || body.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Mesaj en az 10 karakter olmalıdır' });
  }
  
  return errors;
}

/**
 * Send admin notification email
 */
async function sendAdminNotification({ name, email, phone, message }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: `"Şeyda Matematik" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 Yeni İletişim Formu - ${name}`,
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
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">📧 E-posta</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">📱 Telefon</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            <div class="field">
              <div class="label">💬 Mesaj</div>
              <div class="value">${message}</div>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              Bu mesaj ${new Date().toLocaleString('tr-TR')} tarihinde gönderildi.
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
 * Send auto-reply to user
 */
async function sendAutoReply({ name, email }) {
  const mailOptions = {
    from: `"Şeyda Matematik" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Mesajınız Alındı - Şeyda Matematik`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1C2A5E 0%, #4F46E5 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Şeyda Matematik</h1>
            <p>Özel Ders & Eğitim</p>
          </div>
          <div class="content">
            <h2>Merhaba ${name}! 👋</h2>
            <p>Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağım.</p>
            <p>Genellikle 24 saat içinde yanıt vermeye çalışıyorum.</p>
            <br>
            <p>Saygılarımla,<br><strong>Şeyda Öğretmen</strong></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Bu otomatik bir yanıttır. Lütfen bu e-postayı yanıtlamayın.
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
 * Main handler for Vercel Serverless Function
 */
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }
  
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate input
    const errors = validateBody({ name, email, phone, message });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors,
      });
    }
    
    console.log(`📧 Processing contact form from: ${email}`);
    
    // Send emails (fire-and-forget style - but we wait for admin notification)
    try {
      // Send admin notification first (important)
      await sendAdminNotification({ name, email, phone, message });
      console.log(`✅ Admin notification sent for: ${email}`);
      
      // Send auto-reply in background (don't wait)
      sendAutoReply({ name, email }).catch((err) => {
        console.error(`⚠️ Auto-reply failed for ${email}:`, err.message);
      });
      
    } catch (emailError) {
      console.error(`❌ Email error:`, emailError.message);
      // Still return success - the message was received
      // Admin can check logs for email failures
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Mesajınız başarıyla alındı! En kısa sürede size dönüş yapacağız.',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    });
  }
};
