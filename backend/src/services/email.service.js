import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

const getTransporter = () => {
  if (!env.emailEnabled) {
    throw new Error('Email notifications are disabled');
  }

  if (!env.smtpUser || !env.smtpPass || !env.emailFrom) {
    throw new Error('Email SMTP configuration is incomplete');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const activeTransporter = getTransporter();

  return activeTransporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html
  });
};
