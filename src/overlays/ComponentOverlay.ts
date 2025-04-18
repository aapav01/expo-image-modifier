import { Position } from "../types";
import { ViewStyle } from "react-native";

export interface ComponentOverlayOptions {
  component: React.ComponentType<any>;
  position: Position;
  style?: ViewStyle;
}

export class ComponentOverlay {
  private component: React.ComponentType<any>;
  private position: Position;
  private style?: ViewStyle;

  constructor(options: ComponentOverlayOptions) {
    this.component = options.component;
    this.position = options.position;
    this.style = options.style;
  }

  getComponent(): React.ComponentType<any> {
    return this.component;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getStyle(): ViewStyle | undefined {
    return this.style;
  }
}
