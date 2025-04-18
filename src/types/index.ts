export type Position = {
  x: number;
  y: number;
};

export interface OverlayOptions {
  position: Position;
  opacity?: number;
  rotation?: number;
}

export type Size = {
  width: number;
  height: number;
};

export type TextStyle = {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  opacity?: number;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  rotation?: number;
};

export type ImageStyle = {
  opacity?: number;
  rotation?: number;
  scale?: number;
};

export type Marker = {
  id: string;
  position: Position;
  color?: string;
  size?: number;
  label?: string;
};

export type Path = {
  id: string;
  points: Position[];
  color?: string;
  width?: number;
  opacity?: number;
};

export type ImageSource =
  | {
      uri: string;
    }
  | {
      base64: string;
    }
  | {
      localFilePath: string;
    };

export type SaveOptions = {
  format?: "png" | "jpeg";
  quality?: number; // 0 to 1
  base64?: boolean;
};

export type ImageEditorConfig = {
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
};
