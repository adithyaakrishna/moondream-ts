export interface SamplingSettings {
  maxTokens?: number;
}

export interface EncodedImage {
  base64: string;
}

export interface CaptionOutput {
  caption: string | AsyncGenerator<string, void, unknown>;
}

export interface QueryOutput {
  answer: string | AsyncGenerator<string, void, unknown>;
}

export interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
}
