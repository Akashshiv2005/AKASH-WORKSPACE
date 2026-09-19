import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'Akash Workspace Email Relay' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { to, subject, html, text, smtpUser, smtpPass } = body;

    const user = (smtpUser || process.env.SMTP_USER || 'akashsivalingam5@gmail.com').trim();
    const pass = (smtpPass || process.env.SMTP_PASSWORD || 'ukfnmemgezqmuhio').replace(/\s+/g, '').trim();
    const recipient = (to || user).trim();

    if (!recipient) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL on port 465
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    const info = await transporter.sendMail({
      from: `"Akash Workspace" <${user}>`,
      to: recipient,
      subject: subject || '✨ Akash Workspace Notification',
      text: text || undefined,
      html: html || undefined,
    });

    return res.status(200).json({
      success: true,
      message: `Email successfully delivered to ${recipient}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Email Relay Error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to send email: ${error.message || String(error)}`,
    });
  }
}
