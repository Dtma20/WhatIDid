export const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  llm: {
    provider: process.env.LLM_PROVIDER,
  },
  gemini: {
    model: process.env.GEMINI_MODEL,
    apiKey: process.env.GEMINI_API_KEY,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  auth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
    },
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    encryptionKey: process.env.ENCRYPTION_KEY,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});
