import { ImageSource } from "../types";

export interface ImageOverlayOptions {
  source: ImageSource;
  size: { width: number; height: number };
  position: { x: number; y: number };
  opacity?: number;
  rotation?: number;
}

export class ImageOverlay {
  public source: ImageSource;
  public size: { width: number; height: number };
  public position: { x: number; y: number };
  public opacity: number;
  public rotation: number;

  constructor(options: ImageOverlayOptions) {
    this.source = options.source;
    this.size = options.size;
    this.position = options.position;
    this.opacity = options.opacity || 1.0;
    this.rotation = options.rotation || 0;
  }

  async prepare(): Promise<void> {
    // Implementation for prepare method
    // This is referenced in ImageEditor.ts but missing in the current file
  }
}
