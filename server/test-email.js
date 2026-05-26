require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing Gmail SMTP connection...');
  console.log('   GMAIL_USER:', process.env.GMAIL_USER);
  console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : '❌ NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    // First, verify the connection
    await transporter.verify();
    console.log('✅ SMTP connection verified! Credentials are valid.');

    // Now send a test email
    const info = await transporter.sendMail({
      from: `SpendPilot Test <${process.env.GMAIL_USER}>`,
      to: 'rayyanqureshi0123@gmail.com',
      subject: 'SpendPilot Test Email',
      html: '<h2>It works!</h2><p>If you see this, your email setup is correct.</p>',
    });

    console.log('✅ Test email sent! MessageId:', info.messageId);
    console.log('   Check your inbox (and spam folder) at rayyanqureshi0123@gmail.com');
  } catch (err) {
    console.error('❌ EMAIL FAILED:', err.message);
    console.error('   Full error:', err);
  }
}

testEmail();
