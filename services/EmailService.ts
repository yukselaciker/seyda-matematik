/**
 * EmailService.ts - Mock Email Notification Service
 * 
 * Since we don't have a backend yet, this service:
 * - Logs email content to console for verification
 * - Can be easily replaced with a real API call later
 */

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

/**
 * Send email notification (Mock Service)
 * 
 * In production, this would make an API call to a backend service.
 * For now, it logs to console and returns a promise for async compatibility.
 */
export const sendEmailNotification = async (
  to: string,
  subject: string,
  body: string,
  from: string = 'noreply@seydaaciker.com'
): Promise<boolean> => {
  const emailData: EmailData = {
    to,
    subject,
    body,
    from,
  };

  // Log to console for verification
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 EMAIL NOTIFICATION (Mock Service)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Body:');
  console.log(body);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Email logged successfully (Mock Service)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In production, this would be:
  // return await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(emailData),
  // }).then(res => res.ok);

  return true;
};

/**
 * Generate appointment confirmation email body
 */
export const generateAppointmentEmailBody = (
  studentName: string,
  date: string,
  time: string,
  type: 'online' | 'yuz-yuze'
): string => {
  const dateFormatted = new Date(date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const typeText = type === 'online' ? 'Online Ders' : 'Yüz Yüze Ders';

  return `
Merhaba ${studentName},

Randevu talebiniz başarıyla alınmıştır.

📅 Tarih: ${dateFormatted}
🕐 Saat: ${time}
📚 Ders Türü: ${typeText}

Randevunuz onaylandığında size bilgi verilecektir.

Saygılarımla,
Şeyda Açıker
Eğitim Platformu
  `.trim();
};

/**
 * Generate appointment approval email body
 */
export const generateAppointmentApprovalEmailBody = (
  studentName: string,
  date: string,
  time: string,
  type: 'online' | 'yuz-yuze'
): string => {
  const dateFormatted = new Date(date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const typeText = type === 'online' ? 'Online Ders' : 'Yüz Yüze Ders';
  const meetingInfo = type === 'online' 
    ? 'Ders linki yakında size iletilecektir.'
    : 'Ders yüz yüze yapılacaktır. Adres bilgisi yakında size iletilecektir.';

  return `
Merhaba ${studentName},

Randevunuz onaylanmıştır! ✅

📅 Tarih: ${dateFormatted}
🕐 Saat: ${time}
📚 Ders Türü: ${typeText}

${meetingInfo}

Görüşmek üzere!

Saygılarımla,
Şeyda Açıker
Eğitim Platformu
  `.trim();
};

/**
 * Generate appointment rejection email body
 */
export const generateAppointmentRejectionEmailBody = (
  studentName: string,
  date: string,
  time: string
): string => {
  const dateFormatted = new Date(date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
Merhaba ${studentName},

Maalesef ${dateFormatted} tarihinde, saat ${time} için randevu talebiniz uygun değildir.

Lütfen başka bir tarih ve saat seçerek tekrar deneyin.

Saygılarımla,
Şeyda Açıker
Eğitim Platformu
  `.trim();
};

export default {
  sendEmailNotification,
  generateAppointmentEmailBody,
  generateAppointmentApprovalEmailBody,
  generateAppointmentRejectionEmailBody,
};




