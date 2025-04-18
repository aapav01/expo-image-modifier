import * as FileSystem from "expo-file-system";
import { GLView } from "expo-gl";
import { ComponentOverlay } from "../overlays/ComponentOverlay";
import { ImageOverlay } from "../overlays/ImageOverlay";
import { MapOverlay } from "../overlays/MapOverlay";
import { TextOverlay } from "../overlays/TextOverlay";
import { Size } from "../types";

export class GLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(glView?: GLView) {
    // Initialize if GLView is provided in constructor
    if (glView) {
      this.init(glView);
    }
  }

  /**
   * Initialize the 2D canvas context
   */
  init(glView: GLView): void {
    // Get the WebGL context
    this.gl = glView.getContext("webgl");

    if (!this.gl) {
      throw new Error("Failed to get WebGL context");
    }

    // Create a canvas element for 2D drawing
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) {
      throw new Error("Failed to create 2D rendering context");
    }
  }

  /**
   * Render the base image and overlays
   */
  async render(
    baseImage: string,
    options: {
      textOverlays: TextOverlay[];
      imageOverlays: ImageOverlay[];
      componentOverlays: ComponentOverlay[];
      mapOverlay: MapOverlay | null;
      format: string;
      quality: number;
    },
    size: Size | null
  ): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error("Canvas context is not initialized");
    }

    // Set canvas size
    const canvasSize = size || { width: 500, height: 500 };
    this.canvas.width = canvasSize.width;
    this.canvas.height = canvasSize.height;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render the base image
    await this.drawImage(baseImage, canvasSize);

    // Render text overlays
    for (const overlay of options.textOverlays) {
      await this.drawTextOverlay(overlay);
    }

    // Render image overlays
    for (const overlay of options.imageOverlays) {
      await this.drawImageOverlay(overlay);
    }

    // Render component overlays
    for (const overlay of options.componentOverlays) {
      await this.drawComponentOverlay(overlay);
    }

    // Render map overlay if present
    if (options.mapOverlay) {
      await this.drawMapOverlay(options.mapOverlay);
    }

    // Convert canvas to data URL
    const dataUrl = this.canvas.toDataURL(`image/${options.format}`, options.quality);

    // Save data URL to file
    const base64Data = dataUrl.split(',')[1];
    const outputFilePath = `${FileSystem.cacheDirectory}rendered-image-${Date.now()}.${options.format}`;

    await FileSystem.writeAsStringAsync(outputFilePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputFilePath;
  }

  /**
   * Draw the base image
   */
  private async drawImage(imageUri: string, size: Size): Promise<void> {
    if (!this.ctx) return;

    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (this.ctx) {
          this.ctx.drawImage(img, 0, 0, size.width, size.height);
          resolve();
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${error}`));
      };

      img.src = imageUri;
    });
  }

  /**
   * Draw a text overlay
   */
  private async drawTextOverlay(overlay: TextOverlay): Promise<void> {
    if (!this.ctx) return;

    // Apply text styling
    this.ctx.save();

    // Handle rotation if specified
    if (overlay.rotation) {
      this.ctx.translate(overlay.position.x, overlay.position.y);
      this.ctx.rotate((overlay.rotation * Math.PI) / 180);
      this.ctx.translate(-overlay.position.x, -overlay.position.y);
    }

    // Set font properties
    const fontWeight = overlay.style?.fontWeight || "normal";
    const fontSize = overlay.style?.fontSize || 16;
    const fontFamily = overlay.style?.fontFamily || "Arial";
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Text color and opacity
    const color = overlay.style?.color || "#000000";
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = overlay.style?.opacity !== undefined ? overlay.style.opacity : 1.0;

    // Draw background if specified
    if (overlay.style?.backgroundColor) {
      const metrics = this.ctx.measureText(overlay.text);
      const padding = overlay.style.padding || 0;

      let paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0;

      if (typeof padding === 'number') {
        paddingTop = paddingRight = paddingBottom = paddingLeft = padding;
      } else {
        paddingTop = padding.top || 0;
        paddingRight = padding.right || 0;
        paddingBottom = padding.bottom || 0;
        paddingLeft = padding.left || 0;
      }

      this.ctx.fillStyle = overlay.style.backgroundColor;
      this.ctx.fillRect(
        overlay.position.x - paddingLeft,
        overlay.position.y - fontSize - paddingTop,
        metrics.width + paddingLeft + paddingRight,
        fontSize + paddingTop + paddingBottom
      );

      // Reset fill style for text
      this.ctx.fillStyle = color;
    }

    // Draw the text
    this.ctx.fillText(overlay.text, overlay.position.x, overlay.position.y);

    // Restore context
    this.ctx.restore();
  }

  /**
   * Draw an image overlay
   */
  private async drawImageOverlay(overlay: ImageOverlay): Promise<void> {
    if (!this.ctx) return;

    // Get source URI from overlay
    let sourceUri: string;
    if ('uri' in overlay.source) {
      sourceUri = overlay.source.uri;
    } else if ('base64' in overlay.source) {
      sourceUri = overlay.source.base64.startsWith('data:')
        ? overlay.source.base64
        : `data:image/png;base64,${overlay.source.base64}`;
    } else if ('localFilePath' in overlay.source) {
      sourceUri = overlay.source.localFilePath;
    } else {
      throw new Error('Invalid image source format');
    }

    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (this.ctx) {
          this.ctx.save();

          // Apply opacity
          this.ctx.globalAlpha = overlay.opacity;

          // Apply rotation if needed
          if (overlay.rotation) {
            const centerX = overlay.position.x + overlay.size.width / 2;
            const centerY = overlay.position.y + overlay.size.height / 2;

            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((overlay.rotation * Math.PI) / 180);
            this.ctx.translate(-centerX, -centerY);
          }

          // Draw the image
          this.ctx.drawImage(
            img,
            overlay.position.x,
            overlay.position.y,
            overlay.size.width,
            overlay.size.height
          );

          this.ctx.restore();
          resolve();
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load overlay image: ${error}`));
      };

      img.src = sourceUri;
    });
  }

  /**
   * Draw a component overlay
   */
  private async drawComponentOverlay(overlay: ComponentOverlay): Promise<void> {
    // Component rendering would typically involve capturing a React component
    // as an image and then drawing it. For this implementation, we'll assume
    // the component has already been rendered to an image URL.

    if (!this.ctx || !overlay.renderedImageUri) return;

    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (this.ctx) {
          this.ctx.save();

          this.ctx.globalAlpha = overlay.opacity || 1.0;

          // Apply rotation if specified
          if (overlay.rotation) {
            const centerX = overlay.position.x + overlay.size.width / 2;
            const centerY = overlay.position.y + overlay.size.height / 2;

            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((overlay.rotation * Math.PI) / 180);
            this.ctx.translate(-centerX, -centerY);
          }

          this.ctx.drawImage(
            img,
            overlay.position.x,
            overlay.position.y,
            overlay.size.width,
            overlay.size.height
          );

          this.ctx.restore();
          resolve();
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load component image: ${error}`));
      };

      img.src = overlay.renderedImageUri;
    });
  }

  /**
   * Draw a map overlay
   */
  private async drawMapOverlay(overlay: MapOverlay): Promise<void> {
    if (!this.ctx) return;

    // In a real implementation, this would render a map with the specified
    // properties. For this example, we'll draw a placeholder rectangle with markers.

    this.ctx.save();

    // Draw map background
    this.ctx.fillStyle = "#e5e5e5";
    this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);

    // Draw grid lines to simulate a map
    this.ctx.strokeStyle = "#cccccc";
    this.ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let y = 0; y < this.canvas!.height; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas!.width, y);
      this.ctx.stroke();
    }

    // Vertical grid lines
    for (let x = 0; x < this.canvas!.width; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas!.height);
      this.ctx.stroke();
    }

    // Draw markers
    const markers = overlay.getMarkers();
    markers.forEach(marker => {
      this.ctx!.beginPath();
      this.ctx!.fillStyle = marker.color || "#ff0000";

      // Draw marker circle
      const size = marker.size || 10;
      this.ctx!.arc(marker.position.x, marker.position.y, size / 2, 0, Math.PI * 2);
      this.ctx!.fill();

      // Draw label if present
      if (marker.label) {
        this.ctx!.fillStyle = "#000000";
        this.ctx!.font = "12px Arial";
        this.ctx!.fillText(marker.label, marker.position.x + size / 2 + 5, marker.position.y + 4);
      }
    });

    this.ctx.restore();
  }
}

export default GLRenderer;
