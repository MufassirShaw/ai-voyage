export const configuration = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
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
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      embeddingModel:
        process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    upload: {
      maxFileSize: parseInt(
        process.env.UPLOAD_MAX_FILE_SIZE ?? String(10 * 1024 * 1024),
      ),
    },
  };
};
