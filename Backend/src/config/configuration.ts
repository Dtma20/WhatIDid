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
});
