const nodemailer = require('nodemailer');

/**
 * Create email transporter using Gmail SMTP
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Success status
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'AI Mental Health ChatBot'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - AI Mental Health ChatBot',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              color: #666;
              margin-bottom: 30px;
              font-size: 15px;
            }
            .otp-container {
              background: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 25px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry-notice {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .expiry-notice p {
              margin: 0;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #666;
              font-size: 13px;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 5px 0;
            }
            .security-notice {
              margin-top: 20px;
              padding: 15px;
              background: #e7f3ff;
              border-radius: 6px;
              font-size: 13px;
              color: #004085;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 AI Mental Health ChatBot</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello ${name},
              </div>
              
              <div class="message">
                Thank you for signing up! To complete your registration and start chatting with your AI companion, please verify your email address using the code below:
              </div>
              
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="expiry-notice">
                <p>⏰ This code will expire in <strong>10 minutes</strong></p>
              </div>
              
              <div class="security-notice">
                🔒 <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
              </div>
            </div>
            
            <div class="footer">
              <p>If you didn't request this verification code, please ignore this email.</p>
              <p>© ${new Date().getFullYear()} AI Mental Health ChatBot. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hello ${name},

Thank you for signing up for AI Mental Health ChatBot!

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
AI Mental Health ChatBot Team
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${email}`);
        console.log(`Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);

        // Log specific error details
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env file');
        } else if (error.code === 'ESOCKET') {
            console.error('Network error. Please check your internet connection');
        }

        return false;
    }
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready to send emails');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    verifyEmailConfig
};
