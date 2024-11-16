# Moondream TypeScript Client

A lightweight TypeScript client for the Moondream AI vision-language model. This client provides an easy-to-use interface for interacting with the Moondream model, supporting both image captioning and visual question answering.

## Features

- Image captioning
- Visual question answering
- Streaming support for real-time responses
- Support for multiple image input types (ImageData, HTMLImageElement, File)
- Configurable settings via environment variables or constructor options
- Both CommonJS and ESM builds
- TypeScript support out of the box

## Installation

Clone the repository:
```bash
git clone https://github.com/yourusername/moondream-ts.git
cd moondream-ts

# Using pnpm (recommended)
pnpm install

# Build the project
pnpm build
```

## Usage

### Basic Usage

```typescript
import { VL } from './dist';

// Initialize the client
const vl = new VL();

// Generate a caption for an image
const captionResult = await vl.caption(imageFile);
console.log(captionResult.caption);

// Ask a question about an image
const queryResult = await vl.query(imageFile, "What is in this image?");
console.log(queryResult.answer);
```

### Streaming Responses

```typescript
// Stream caption tokens
const streamResult = await vl.caption(imageFile, 'normal', true);
for await (const token of streamResult.caption) {
  process.stdout.write(token);
}

// Stream query response
const queryStream = await vl.query(
  imageFile, 
  "What is in this image?", 
  true
);
for await (const token of queryStream.answer) {
  process.stdout.write(token);
}
```

### Configuration

You can configure the client either through environment variables or constructor options.

#### Environment Variables

Create a `.env` file in your project root:

```env
MOONDREAM_BASE_URL=http://localhost:3000
MOONDREAM_MAX_TOKENS=2048
```

#### Constructor Options

```typescript
const vl = new VL({
  baseUrl: 'http://localhost:3000',
  timeout: 5000
});
```

### Advanced Usage

```typescript
// Custom sampling settings
const result = await vl.caption(imageFile, 'normal', false, {
  maxTokens: 100
});

// Pre-encode image for multiple queries
const encodedImage = await vl.encodeImage(imageFile);
const caption = await vl.caption(encodedImage);
const answer = await vl.query(encodedImage, "What colors do you see?");
```

## Development

### Setup Development Environment

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/moondream-ts.git
cd moondream-ts
pnpm install
```

2. Start development:
```bash
pnpm dev
```

### Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Linting and Formatting

```bash
# Run ESLint
pnpm lint

# Format code with Prettier
pnpm format
```

## API Reference

### `VL` Class

#### Constructor
```typescript
new VL(config?: ClientConfig)
```

#### Methods

##### `caption()`
```typescript
async caption(
  image: ImageData | HTMLImageElement | File | EncodedImage,
  length?: string,
  stream?: boolean,
  settings?: SamplingSettings
): Promise<CaptionOutput>
```

##### `query()`
```typescript
async query(
  image: ImageData | HTMLImageElement | File | EncodedImage,
  question: string,
  stream?: boolean,
  settings?: SamplingSettings
): Promise<QueryOutput>
```

##### `encodeImage()`
```typescript
async encodeImage(
  image: ImageData | HTMLImageElement | File | EncodedImage
): Promise<EncodedImage>
```

### Types

```typescript
interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
}

interface SamplingSettings {
  maxTokens?: number;
}

interface CaptionOutput {
  caption: string | AsyncGenerator<string, void, unknown>;
}

interface QueryOutput {
  answer: string | AsyncGenerator<string, void, unknown>;
}
```
