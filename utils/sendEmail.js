const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  console.log('--- SendEmail Config Check ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('User:', process.env.SMTP_USER);
  console.log('Port:', process.env.SMTP_PORT);
  
  if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST is not defined in environment variables.');
  }

  // Create transporter using SMTP credentials from ENV
  const transporter = nodemailer.createTransport({
    secure: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: subject,
    text: message, // Plain text body
    html: message.replace(/\n/g, '<br>'), // HTML body
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
