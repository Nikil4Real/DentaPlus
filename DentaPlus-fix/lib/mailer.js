// lib/mailer.js
// Sends the OTP email via Gmail SMTP using Nodemailer.
//
// GMAIL_APP_PASSWORD must be a 16-character Google "App Password", NOT your
// normal Gmail password. Generate one at https://myaccount.google.com/apppasswords
// (requires 2-Step Verification enabled on the Gmail account).

import nodemailer from 'nodemailer';

let transporter = global.__dentaplus_mail_transport;

if (!transporter) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  global.__dentaplus_mail_transport = transporter;
}

export async function sendOtpEmail(toEmail, userName, otpCode) {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 24px; color: #f8fafc;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155;">
        <h2 style="color: #a855f7; margin-top: 0;">DentaPlus Portal Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Use the 6-digit verification code below to complete your passwordless sign-in request:</p>
        <div style="background-color: #0f172a; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #a855f7; border-radius: 12px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code is valid for <strong>5 minutes</strong>. If you did not request this login, please ignore this message.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"DentaPlus Practice Portal" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Your DentaPlus Verification Code: ${otpCode}`,
    html,
    text: `Hello ${userName},\n\nYour DentaPlus verification code is: ${otpCode}\nThis code expires in 5 minutes.`,
  });
}
