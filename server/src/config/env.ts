import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  port: Number(required('PORT', '4000')),
  mongodbUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/teachingcareer'),
  clientOrigin: required('CLIENT_ORIGIN', 'http://localhost:5173'),
  maxUploadMb: Number(required('MAX_UPLOAD_MB', '5')),
  jwtSecret: required(
    'JWT_SECRET',
    process.env.NODE_ENV === 'production' ? undefined : 'dev-only-insecure-secret-change-me',
  ),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
  nodeEnv: required('NODE_ENV', 'development'),

  // Optional — Google Sign-In stays disabled (routes respond 503) until both
  // are set. Never fabricate values here; there is no working fallback.
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,

  // Optional — outgoing contact-form email stays disabled (silently skipped,
  // the message is still saved to the database either way) until both are
  // set. Never fabricate values here; there is no working fallback.
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  contactRecipientEmail: required('CONTACT_RECIPIENT_EMAIL', 'itgraduate2025@gmail.com'),
}
