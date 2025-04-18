import * as FileSystem from "expo-file-system";
import {
  ComponentOverlay,
  ComponentOverlayOptions,
} from "./overlays/ComponentOverlay";
import { ImageOverlay, ImageOverlayOptions } from "./overlays/ImageOverlay";
import { MapOverlay, MapOverlayOptions } from "./overlays/MapOverlay";
import { TextOverlay, TextOverlayOptions } from "./overlays/TextOverlay";
import { GLRenderer } from "./renderers/GLRenderer";
import {
  ImageEditorConfig,
  ImageSource,
  Position,
  SaveOptions,
  Size,
} from "./types";
import { getImageDimensions, normalizeImageSource } from "./utils/image-loader";

export class ImageEditor {
  private sourceUri: string | null = null;
  private size: Size | null = null;
  private textOverlays: TextOverlay[] = [];
  private imageOverlays: ImageOverlay[] = [];
  private componentOverlays: ComponentOverlay[] = [];
  private mapOverlay: MapOverlay | null = null;
  private config: ImageEditorConfig;
  private renderer: GLRenderer | null = null;

  constructor(config: ImageEditorConfig = {}) {
    this.config = {
      preserveAspectRatio: true,
      ...config,
    };
  }

  setRenderer(renderer: GLRenderer): void {
    this.renderer = renderer;
  }

  static async fromUri(
    uri: string,
    config?: ImageEditorConfig
  ): Promise<ImageEditor> {
    const editor = new ImageEditor(config);
    const renderer = new GLRenderer();
    editor.setRenderer(renderer);
    await editor.loadImage({ uri });
    return editor;
  }

  static async fromBase64(
    base64: string,
    config?: ImageEditorConfig
  ): Promise<ImageEditor> {
    const editor = new ImageEditor(config);
    const renderer = new GLRenderer();
    editor.setRenderer(renderer);
    await editor.loadImage({ base64 });
    return editor;
  }

  static async fromLocalFile(
    localFilePath: string,
    config?: ImageEditorConfig
  ): Promise<ImageEditor> {
    const editor = new ImageEditor(config);
    const renderer = new GLRenderer();
    editor.setRenderer(renderer);
    await editor.loadImage({ localFilePath });
    return editor;
  }

  async loadImage(source: ImageSource): Promise<void> {
    try {
      this.sourceUri = await normalizeImageSource(source);
      this.size = await getImageDimensions(this.sourceUri);

      this.textOverlays = [];
      this.imageOverlays = [];
      this.componentOverlays = [];
      this.mapOverlay = null;
    } catch (error) {
      throw new Error(`Failed to load image: ${error}`);
    }
  }

  addText(options: TextOverlayOptions): ImageEditor {
    const textOverlay = new TextOverlay(options);
    this.textOverlays.push(textOverlay);
    return this;
  }

  async addImage(options: ImageOverlayOptions): Promise<ImageEditor> {
    const imageOverlay = new ImageOverlay(options);
    await imageOverlay.prepare();
    this.imageOverlays.push(imageOverlay);
    return this;
  }

  addComponent(options: ComponentOverlayOptions): ImageEditor {
    const componentOverlay = new ComponentOverlay(options);
    this.componentOverlays.push(componentOverlay);
    return this;
  }

  setupMap(options: MapOverlayOptions): ImageEditor {
    this.mapOverlay = new MapOverlay(options);
    return this;
  }

  addMarker(marker: {
    position: Position;
    color?: string;
    size?: number;
    label?: string;
    id?: string;
  }): ImageEditor {
    if (!this.mapOverlay) {
      this.mapOverlay = new MapOverlay();
    }

    this.mapOverlay.addMarker({
      id:
        marker.id ||
        `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: marker.position,
      color: marker.color,
      size: marker.size,
      label: marker.label,
    });

    return this;
  }

  async saveAsFile(options: SaveOptions = {}): Promise<string> {
    if (!this.renderer) {
      throw new Error("Renderer is not set or invalid");
    }

    try {
      const result = await this.renderer.render(this.sourceUri as string, {
        textOverlays: this.textOverlays,
        imageOverlays: this.imageOverlays,
        componentOverlays: this.componentOverlays,
        mapOverlay: this.mapOverlay,
        format: options.format || "png",
        quality: options.quality || 0.9,
      }, this.size);

      if (options.base64) {
        const base64 = await FileSystem.readAsStringAsync(result, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/${options.format || "png"};base64,${base64}`;
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to save image: ${error}`);
    }
  }

  getSourceUri(): string | null {
    return this.sourceUri;
  }

  getSize(): Size | null {
    return this.size;
  }

  getTextOverlays(): TextOverlay[] {
    return this.textOverlays;
  }

  getImageOverlays(): ImageOverlay[] {
    return this.imageOverlays;
  }

  getComponentOverlays(): ComponentOverlay[] {
    return this.componentOverlays;
  }

  getMapOverlay(): MapOverlay | null {
    return this.mapOverlay;
  }

  clearOverlays(): ImageEditor {
    this.textOverlays = [];
    this.imageOverlays = [];
    this.componentOverlays = [];
    this.mapOverlay = null;
    return this;
  }
}

export default ImageEditor;
