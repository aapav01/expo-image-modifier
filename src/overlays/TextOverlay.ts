import { TextStyle } from "react-native";
import { OverlayOptions } from "../types";

export interface TextOverlayOptions extends OverlayOptions {
  text: string;
  style?: TextStyle;
  position: { x: number; y: number };
  backgroundColor?: string;
  rotation?: number;
}

export class TextOverlay {
  private text: string;
  private style: TextStyle;
  private position: { x: number; y: number };
  private backgroundColor: string | null;
  private rotation: number;

  constructor(options: TextOverlayOptions) {
    this.text = options.text;
    this.style = options.style || {};
    this.position = options.position || { x: 0, y: 0 };
    this.backgroundColor = options.backgroundColor || null;
    this.rotation = options.rotation || 0;
  }

  getText(): string {
    return this.text;
  }

  getStyle(): TextStyle {
    return this.style;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getBackgroundColor(): string | null {
    return this.backgroundColor;
  }

  getRotation(): number {
    return this.rotation;
  }
}
