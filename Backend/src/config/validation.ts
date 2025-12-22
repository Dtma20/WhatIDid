import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  LLM_PROVIDER: Joi.string().required(),
  GEMINI_MODEL: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().required(),
  GITHUB_TOKEN: Joi.string().optional(),
});
