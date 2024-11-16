export interface Config {
  maxTokens: number;
  baseUrl: string;
}

export function getConfig(): Config {
  return {
    maxTokens: getMaxTokens(),
    baseUrl: getBaseUrl(),
  };
}

export function getMaxTokens(): number {
  const envMaxTokens = process.env.MOONDREAM_MAX_TOKENS;
  if (envMaxTokens) {
    const parsed = parseInt(envMaxTokens, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
    console.warn(
      'Invalid MOONDREAM_MAX_TOKENS value. Using default value of 1024.'
    );
  }
  return 1024;
}

export function getBaseUrl(): string {
  return process.env.MOONDREAM_BASE_URL || 'http://localhost:8080';
}
