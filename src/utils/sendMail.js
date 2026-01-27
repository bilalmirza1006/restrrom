import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: parseInt(process.env.NODEMAILER_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendNotificationMail = async ({
  to,
  subject,
  severity = 'low',
  text,
  userName,
  sensorId,
  additionalData = {},
  alertOrigin = 'Air Quality System',
}) => {
  try {
    console.log('🔔 Preparing notification email...');
    console.log(`📧 To: ${to}, Subject: ${subject}, Severity: ${severity}`);

    if (!to || !subject || !text) {
      throw new Error('Missing required email parameters: to, subject, or text');
    }

    // Determine color based on severity
    let color = '#28a745'; // green for low
    let severityText = 'LOW';

    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        color = '#dc3545';
        severityText = 'HIGH';
        break;
      case 'medium':
        color = '#ffc107';
        severityText = 'MEDIUM';
        break;
      default:
        color = '#28a745';
        severityText = 'LOW';
    }

    // Create HTML template
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #004b8d; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Air Quality Alert</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px;">${alertOrigin}</h2>
        </div>
        
        <!-- Severity Badge -->
        <div style="padding: 20px; text-align: center; background: #f8f9fa;">
          <div style="background: ${color}; color: #fff; padding: 12px 20px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
            ${severityText} PRIORITY: ${subject}
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${userName || 'User'}</strong>,</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid ${color}; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px;">${text}</p>
          </div>
          
          ${sensorId ? `<p><strong>Sensor ID:</strong> ${sensorId}</p>` : ''}
          ${
            additionalData.location
              ? `<p><strong>Location:</strong> ${additionalData.location}</p>`
              : ''
          }
          ${
            additionalData.timestamp
              ? `<p><strong>Time:</strong> ${new Date(additionalData.timestamp).toLocaleString()}</p>`
              : ''
          }
          
          <p style="margin-top: 30px;">
            Please take appropriate action based on the severity level.<br/>
            <strong>Thank you,</strong><br/>
            <em>Air Quality Team</em>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #6c757d; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Air Quality System. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </div>`;

    const mailOptions = {
      from: process.env.NODEMAILER_FROM || 'noreply@airquality.com',
      to,
      subject: `[${severityText}] ${subject}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error in sendNotificationMail:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendWelcomeEmail = async (to, userName) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome ${userName}!</h2>
        <p>Thank you for joining our Air Quality Monitoring System.</p>
        <p>You will receive notifications about sensor alerts and system updates.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.NODEMAILER_FROM,
      to,
      subject: 'Welcome to Air Quality Monitoring System',
      html,
    });

    console.log(`✅ Welcome email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
