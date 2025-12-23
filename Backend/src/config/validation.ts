import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  LLM_PROVIDER: Joi.string().required(),
  GEMINI_MODEL: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().required(),
  GITHUB_TOKEN: Joi.string().optional(),

  // OAuth Configuration
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CALLBACK_URL: Joi.string().uri().default('http://localhost:3000/auth/github/callback'),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // Encryption Configuration
  ENCRYPTION_KEY: Joi.string().min(32).required(),

  // Frontend URL
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});
