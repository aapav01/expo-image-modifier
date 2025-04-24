import {
  ModifyImageOptions,
  ModifiedImageResult,
  ImageSource,
  ExpoImageModifierModule,
} from "./ExpoImageModifier.types";

class ExpoImageModifierModuleWeb implements ExpoImageModifierModule {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }

  async modifyImage(options: ModifyImageOptions): Promise<ModifiedImageResult> {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Load the source image
    const sourceImage = await this.loadImage(options.source);
    const img = await this.loadImageElement(sourceImage.uri);

    // Set canvas size to match source image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the source image
    ctx.drawImage(img, 0, 0);

    // Apply overlays
    if (options.overlays) {
      // Apply text overlays
      if (options.overlays.text) {
        for (const textOverlay of options.overlays.text) {
          ctx.save();
          ctx.font = `${textOverlay.style?.fontSize || 16}px ${textOverlay.style?.fontFamily || "Arial"}`;
          ctx.fillStyle = textOverlay.style?.color || "black";
          ctx.globalAlpha = textOverlay.style?.opacity || 1;
          if (textOverlay.style?.backgroundColor) {
            const textMetrics = ctx.measureText(textOverlay.text);
            ctx.fillStyle = textOverlay.style.backgroundColor;
            ctx.fillRect(
              textOverlay.position.x,
              textOverlay.position.y - textMetrics.actualBoundingBoxAscent,
              textMetrics.width,
              textMetrics.actualBoundingBoxAscent +
                textMetrics.actualBoundingBoxDescent
            );
          }
          ctx.fillText(
            textOverlay.text,
            textOverlay.position.x,
            textOverlay.position.y
          );
          ctx.restore();
        }
      }

      // Apply image overlays
      if (options.overlays.images) {
        for (const imageOverlay of options.overlays.images) {
          const overlayImg = await this.loadImageElement(
            imageOverlay.source.uri!
          );
          ctx.save();
          ctx.globalAlpha = imageOverlay.opacity || 1;
          if (imageOverlay.rotation) {
            ctx.translate(
              imageOverlay.position.x + imageOverlay.size.width / 2,
              imageOverlay.position.y + imageOverlay.size.height / 2
            );
            ctx.rotate((imageOverlay.rotation * Math.PI) / 180);
            ctx.drawImage(
              overlayImg,
              -imageOverlay.size.width / 2,
              -imageOverlay.size.height / 2,
              imageOverlay.size.width,
              imageOverlay.size.height
            );
          } else {
            ctx.drawImage(
              overlayImg,
              imageOverlay.position.x,
              imageOverlay.position.y,
              imageOverlay.size.width,
              imageOverlay.size.height
            );
          }
          ctx.restore();
        }
      }
    }

    // Convert to desired format
    const mimeType =
      options.outputFormat === "png" ? "image/png" : "image/jpeg";
    const quality = options.quality || 0.92;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    return {
      uri: dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  }

  async loadImage(source: ImageSource): Promise<ModifiedImageResult> {
    if (source.uri) {
      const img = await this.loadImageElement(source.uri);
      return {
        uri: source.uri,
        width: img.width,
        height: img.height,
      };
    } else if (source.base64) {
      const img = await this.loadImageElement(
        `data:image/jpeg;base64,${source.base64}`
      );
      return {
        uri: source.base64,
        width: img.width,
        height: img.height,
      };
    } else {
      throw new Error("Unsupported image source");
    }
  }

  private loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Required by NativeModule interface
  emit(eventName: string, ...args: any[]): void {
    // Web implementation doesn't need to emit events
  }
}

export default new ExpoImageModifierModuleWeb();
