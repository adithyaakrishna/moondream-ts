import { VL } from '../src';

global.fetch = jest.fn();
global.AbortController = jest.fn(() => ({
  abort: jest.fn(),
  signal: null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;

describe('VL', () => {
  let vl: VL;
  let mockImage: HTMLImageElement;

  beforeEach(() => {
    jest.clearAllMocks();

    vl = new VL();

    mockImage = new Image();
    mockImage.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const defaultVL = new VL();
      expect(defaultVL).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customVL = new VL({
        baseUrl: 'http://custom.local:8080',
        timeout: 5000,
      });
      expect(customVL).toBeDefined();
    });
  });

  describe('caption', () => {
    it('should generate caption successfully', async () => {
      const mockResponse = { caption: 'A beautiful landscape' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await vl.caption(mockImage);
      expect(result.caption).toBe('A beautiful landscape');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/caption'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should stream caption tokens', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('A beautiful'));
          controller.enqueue(new TextEncoder().encode(' landscape'));
          controller.close();
        },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const result = await vl.caption(mockImage, 'normal', true);

      if (typeof result.caption !== 'string') {
        let caption = '';
        for await (const chunk of result.caption) {
          caption += chunk;
        }
        expect(caption).toBe('A beautiful landscape');
      }
    });
  });

  describe('query', () => {
    it('should process query successfully', async () => {
      const mockResponse = { answer: 'There are two people' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await vl.query(
        mockImage,
        'How many people are in the image?'
      );
      expect(result.answer).toBe('There are two people');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/query'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should stream query response', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('There are'));
          controller.enqueue(new TextEncoder().encode(' two people'));
          controller.close();
        },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const result = await vl.query(
        mockImage,
        'How many people are in the image?',
        true
      );

      if (typeof result.answer !== 'string') {
        let answer = '';
        for await (const chunk of result.answer) {
          answer += chunk;
        }
        expect(answer).toBe('There are two people');
      }
    });
  });

  describe('timeout', () => {
    it('should timeout after specified duration', async () => {
      const shortTimeout = new VL({ timeout: 100 });

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 200))
      );

      await expect(shortTimeout.caption(mockImage)).rejects.toThrow(
        'The operation was aborted'
      );
    });
  });
});
