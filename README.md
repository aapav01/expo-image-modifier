# Expo Image Modifier

A library for modifying images using Expo and OpenGL for 2D rendering. This library provides utilities for loading images from various sources, adding overlays (text, images, components, and maps), and saving the modified images.

## Features

- Load images from URI, base64, or local file paths.
- Add text overlays with customizable styles.
- Overlay images with adjustable properties.
- Integrate React components as overlays.
- Plot coordinates and markers on images using map overlays.
- Render images and overlays using OpenGL for high performance.

## Installation

To install the library, run:

```bash
npm install expo-image-modifier
```

or

```bash
yarn add expo-image-modifier
```

## Usage

### Basic Example

```typescript
import { ImageEditor } from 'expo-image-modifier';

async function modifyImage() {
  const editor = await ImageEditor.fromUri('your-image-uri');

  editor.addText({
    text: 'Hello World',
    position: { x: 10, y: 10 },
    fontSize: 20,
    color: 'white',
  });

  const modifiedImageUri = await editor.saveAsFile();
  console.log('Modified image saved at:', modifiedImageUri);
}
```

### Overlays

You can add various overlays to your images:

- **Text Overlay**: Use `addText(options)` to add text.
- **Image Overlay**: Use `addImage(options)` to overlay another image.
- **Component Overlay**: Use `addComponent(options)` to render a React component.
- **Map Overlay**: Use `setupMap(options)` to add a map overlay with markers.

## Example Application

An example application demonstrating the usage of the library can be found in the `example` directory. To run the example:

1. Navigate to the `example` directory.
2. Run `npm install` or `yarn` to install dependencies.
3. Start the application with `npm start` or `yarn start`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
