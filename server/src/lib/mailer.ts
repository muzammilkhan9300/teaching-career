import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

export const mailerConfigured = Boolean(env.smtpUser && env.smtpPass)

const transporter = mailerConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.smtpUser, pass: env.smtpPass },
    })
  : null

interface ContactEmailInput {
  name: string
  email: string
  message: string
}

/**
 * Fire-and-forget — the contact message is already saved to the database
 * before this is called, so a mail failure (or the SMTP credentials simply
 * not being configured yet) should never fail the user-facing submission.
 */
export function sendContactEmail(input: ContactEmailInput) {
  if (!transporter) {
    console.warn('[mailer] SMTP_USER/SMTP_PASS not configured — skipping contact-form email notification.')
    return
  }

  transporter
    .sendMail({
      from: `"TeachingCareer Website" <${env.smtpUser}>`,
      to: env.contactRecipientEmail,
      replyTo: `"${input.name}" <${input.email}>`,
      subject: `New contact message from ${input.name}`,
      text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      html: `
        <p><strong>From:</strong> ${input.name} (${input.email})</p>
        <p><strong>Message:</strong></p>
        <p>${input.message.replace(/\n/g, '<br>')}</p>
      `,
    })
    .catch((err) => {
      console.error('[mailer] failed to send contact-form email', err)
    })
}
