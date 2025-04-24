# Expo Image Modifier

A powerful library for modifying images in React Native using Expo. This library provides utilities for loading images from various sources, adding overlays (text, images, components, and maps), and returning the modified images.

## Features

- Load images from URI, base64, or local file paths
- Add text overlays with customizable styles
- Overlay images with adjustable properties
- Integrate React components as overlays
- Plot coordinates and markers on images using map overlays
- Render images and overlays using native platform capabilities for high performance

## Installation

```bash
npx expo install expo-image-modifier
```

## Basic Usage

```typescript
import * as ImageModifier from 'expo-image-modifier';

// Load an image
const image = await ImageModifier.loadImage({
  uri: 'https://example.com/image.jpg'
});

// Modify an image with overlays
const modifiedImage = await ImageModifier.modifyImage({
  source: {
    uri: 'https://example.com/image.jpg'
  },
  overlays: {
    text: [
      {
        text: 'Hello World',
        position: { x: 100, y: 100 },
        style: {
          fontSize: 24,
          color: '#FF0000',
          fontFamily: 'Arial',
          backgroundColor: '#FFFFFF',
          opacity: 0.8
        }
      }
    ],
    images: [
      {
        source: {
          uri: 'https://example.com/overlay.png'
        },
        position: { x: 200, y: 200 },
        size: { width: 100, height: 100 },
        opacity: 0.5,
        rotation: 45
      }
    ]
  },
  outputFormat: 'jpeg',
  quality: 0.9
});
```

## API Reference

### `loadImage(source: ImageSource): Promise<ModifiedImageResult>`

Loads an image from various sources.

#### Parameters

- `source`: The image source to load
  - `uri`: Remote URL or local file URI
  - `base64`: Base64 encoded image data
  - `localPath`: Local file path

#### Returns

```typescript
{
  uri: string;
  width: number;
  height: number;
}
```

### `modifyImage(options: ModifyImageOptions): Promise<ModifiedImageResult>`

Modifies an image with the specified overlays and options.

#### Parameters

- `options`: The modification options
  - `source`: The source image to modify
  - `overlays`: Optional overlay configurations
    - `text`: Array of text overlays
    - `images`: Array of image overlays
    - `maps`: Array of map overlays
    - `components`: Array of component overlays
  - `outputFormat`: Output format ('jpeg' or 'png')
  - `quality`: Output quality (0-1)

#### Returns

```typescript
{
  uri: string;
  width: number;
  height: number;
}
```

## Examples

### Adding Text Overlay

```typescript
const result = await ImageModifier.modifyImage({
  source: {
    uri: 'https://example.com/image.jpg'
  },
  overlays: {
    text: [
      {
        text: 'Hello World',
        position: { x: 100, y: 100 },
        style: {
          fontSize: 24,
          color: '#FF0000',
          fontFamily: 'Arial',
          backgroundColor: '#FFFFFF',
          opacity: 0.8
        }
      }
    ]
  }
});
```

### Adding Image Overlay

```typescript
const result = await ImageModifier.modifyImage({
  source: {
    uri: 'https://example.com/image.jpg'
  },
  overlays: {
    images: [
      {
        source: {
          uri: 'https://example.com/overlay.png'
        },
        position: { x: 200, y: 200 },
        size: { width: 100, height: 100 },
        opacity: 0.5,
        rotation: 45
      }
    ]
  }
});
```

### Combining Multiple Overlays

```typescript
const result = await ImageModifier.modifyImage({
  source: {
    uri: 'https://example.com/image.jpg'
  },
  overlays: {
    text: [
      {
        text: 'Title',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 32,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          backgroundColor: '#000000',
          opacity: 0.8
        }
      }
    ],
    images: [
      {
        source: {
          uri: 'https://example.com/logo.png'
        },
        position: { x: 20, y: 20 },
        size: { width: 50, height: 50 }
      }
    ]
  },
  outputFormat: 'png',
  quality: 0.9
});
```

## Platform Support

- iOS
- Android
- Web

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
