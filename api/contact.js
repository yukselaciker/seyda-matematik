/**
 * Vercel Serverless Function - Contact Form Handler
 * 
 * Endpoint: POST /api/contact
 * 
 * Sends email notifications using Nodemailer with Gmail.
 * 
 * Environment Variables (set in Vercel Dashboard):
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASSWORD: Gmail App Password (16 chars, no spaces)
 * - ADMIN_EMAIL: (optional) Email to receive notifications
 */

const nodemailer = require('nodemailer');

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
 * Main handler
 */
module.exports = async (req, res) => {
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
    const { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanları doldurunuz.',
      });
    }
    
    console.log(`📧 Contact form from: ${name} <${email}>`);
    
    // Send email
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
