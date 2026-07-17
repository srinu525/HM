import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "5000"), 10),

  DATABASE_URL: required("DATABASE_URL"),
  DIRECT_URL: optional("DIRECT_URL", ""),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),

  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:3000"),

  SMTP_HOST: optional("SMTP_HOST", ""),
  SMTP_PORT: parseInt(optional("SMTP_PORT", "587"), 10),
  SMTP_SECURE: optional("SMTP_SECURE", "false"),
  SMTP_USER: optional("SMTP_USER", ""),
  SMTP_PASS: optional("SMTP_PASS", ""),
  SMTP_FROM: optional("SMTP_FROM", "noreply@hospital.com"),

  CRON_ENABLED: optional("CRON_ENABLED", "true") === "true",

  get isDevelopment() {
    return this.NODE_ENV === "development";
  },
  get isProduction() {
    return this.NODE_ENV === "production";
  },
} as const;
