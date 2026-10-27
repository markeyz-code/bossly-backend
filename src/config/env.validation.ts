import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(4100),
  APP_URL: Joi.string().uri().default('http://localhost:3100'),
  ADMIN_URL: Joi.string().uri().default('http://localhost:3101'),
  API_URL: Joi.string().uri().default('http://localhost:4100/api/v1'),
  PUBLIC_ROOT_DOMAIN: Joi.string().hostname().default('bossly.ng'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3100,http://localhost:3101'),
  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().uri().optional().allow(''),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('30d'),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow(''),
  CLOUDINARY_API_KEY: Joi.string().optional().allow(''),
  CLOUDINARY_API_SECRET: Joi.string().optional().allow(''),
  CLOUDINARY_FOLDER: Joi.string().default('bossly'),
  RESEND_API_KEY: Joi.string().optional().allow(''),
  MAIL_FROM: Joi.string().default('Bossly <hello@bossly.ng>'),
  MAIL_REPLY_TO: Joi.string().optional().allow(''),
  PAYSTACK_SECRET_KEY: Joi.string().optional().allow(''),
  PAYSTACK_PUBLIC_KEY: Joi.string().optional().allow(''),
  PAYSTACK_WEBHOOK_SECRET: Joi.string().optional().allow(''),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().optional().allow(''),
  WHATSAPP_BUSINESS_ACCOUNT_ID: Joi.string().optional().allow(''),
  WHATSAPP_ACCESS_TOKEN: Joi.string().optional().allow(''),
  WHATSAPP_VERIFY_TOKEN: Joi.string().default('bossly-webhook-verify'),
  WHATSAPP_APP_SECRET: Joi.string().optional().allow(''),
  WHATSAPP_PLATFORM_NUMBER: Joi.string().optional().allow(''),
  LLM_API_KEY: Joi.string().optional().allow(''),
  LLM_BASE_URL: Joi.string().uri().default('https://api.openai.com/v1'),
  LLM_MODEL: Joi.string().default('gpt-4o-mini'),
  SEED_SUPER_ADMIN_EMAIL: Joi.string().email().optional().allow(''),
  SEED_SUPER_ADMIN_PASSWORD: Joi.string().min(8).optional().allow(''),
}).unknown(true);

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const { error, value } = envSchema.validate(config, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
  const env = value as Record<string, any>;
  if (env.NODE_ENV === 'production') {
    const problems: string[] = [];
    if (String(env.MONGODB_URI || '').includes('localhost') || String(env.MONGODB_URI || '').includes('127.0.0.1')) {
      problems.push('MONGODB_URI must point to a managed MongoDB (Atlas), not localhost, in production.');
    }
    for (const key of ['APP_URL', 'API_URL', 'ADMIN_URL']) {
      if (!String(env[key] || '').startsWith('https://')) problems.push(`${key} must use https:// in production.`);
    }
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      problems.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
    }
    if (env.PUBLIC_ROOT_DOMAIN === 'localhost' || String(env.PUBLIC_ROOT_DOMAIN).endsWith('.localhost')) {
      problems.push('PUBLIC_ROOT_DOMAIN must be the production root domain.');
    }
    if (!String(env.ALLOWED_ORIGINS || '').includes('https://')) {
      problems.push('ALLOWED_ORIGINS must list the production web/admin https origins.');
    }
    if (problems.length) throw new Error(`Production environment is not safe to boot:\n- ${problems.join('\n- ')}`);
  }
  return value as Record<string, unknown>;
}
