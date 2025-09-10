export const ENV = Object.seal({
  PORT: Number(process.env.PORT) || 3009,
  isProd: process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'testing',
  API: Object.seal({
    url: process.env.API_URL,
  }),
  FLOW_CALL: {
    use_gemini: process.env.FLOW_CALL_USE_GEMINI === 'true',
  },
  debugLangSmithOnFlow: process.env.DEBUG_LANGSMITH_ON_FLOW === 'true',
});
