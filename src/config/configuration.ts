export const configuration = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY is not set');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  return {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024'),
    },
    voyage: {
      apiKey: process.env.VOYAGE_API_KEY,
      model: process.env.VOYAGE_MODEL || 'voyage-3',
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  };
};
