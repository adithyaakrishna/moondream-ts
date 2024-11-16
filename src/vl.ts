import {
  SamplingSettings,
  EncodedImage,
  CaptionOutput,
  QueryOutput,
  ClientConfig,
} from './types';
import { getConfig } from './config';

export class VL {
  private baseUrl: string;
  private timeout: number;
  private maxTokens: number;

  constructor(config: ClientConfig = {}) {
    const defaultConfig = getConfig();

    this.baseUrl = config.baseUrl || defaultConfig.baseUrl;
    this.timeout = config.timeout || 30000;
    this.maxTokens = defaultConfig.maxTokens;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number }
  ): Promise<Response> {
    const { timeout = this.timeout } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return response;
    } finally {
      clearTimeout(id);
    }
  }

  private async imageToBase64(
    image: ImageData | HTMLImageElement | File
  ): Promise<string> {
    if (image instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
    }

    // For ImageData or HTMLImageElement, create a canvas to convert to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (image instanceof HTMLImageElement) {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.drawImage(image, 0, 0);
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.putImageData(image, 0, 0);
    }

    return canvas.toDataURL('image/jpeg');
  }

  async encodeImage(
    image: ImageData | HTMLImageElement | File | EncodedImage
  ): Promise<EncodedImage> {
    if ('base64' in image) {
      return image;
    }

    const base64 = await this.imageToBase64(image);
    return { base64 };
  }

  private async *streamResponse(
    response: Response
  ): AsyncGenerator<string, void, unknown> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  }

  async caption(
    image: ImageData | HTMLImageElement | File | EncodedImage,
    length: string = 'normal',
    stream: boolean = false,
    settings?: SamplingSettings
  ): Promise<CaptionOutput> {
    try {
      const encodedImage = await this.encodeImage(image);
      const maxTokens = settings?.maxTokens || this.maxTokens;

      const response = await this.fetchWithTimeout(`${this.baseUrl}/caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: encodedImage.base64,
          length,
          stream,
          max_tokens: maxTokens,
        }),
      });

      if (stream) {
        return { caption: this.streamResponse(response) };
      }

      const data = await response.json();
      return { caption: data.caption };
    } catch (error) {
      throw new Error(`Failed to generate caption: ${error}`);
    }
  }

  async query(
    image: ImageData | HTMLImageElement | File | EncodedImage,
    question: string,
    stream: boolean = false,
    settings?: SamplingSettings
  ): Promise<QueryOutput> {
    try {
      const encodedImage = await this.encodeImage(image);
      const maxTokens = settings?.maxTokens || this.maxTokens;

      const response = await this.fetchWithTimeout(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: encodedImage.base64,
          question,
          stream,
          max_tokens: maxTokens,
        }),
      });

      if (stream) {
        return { answer: this.streamResponse(response) };
      }

      const data = await response.json();
      return { answer: data.answer };
    } catch (error) {
      throw new Error(`Failed to process query: ${error}`);
    }
  }
}
