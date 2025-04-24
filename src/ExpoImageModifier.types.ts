import type { StyleProp, ViewStyle } from "react-native";

export type ImageSource = {
  uri?: string;
  base64?: string;
  localPath?: string;
};

export type TextOverlay = {
  text: string;
  position: {
    x: number;
    y: number;
  };
  style?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    backgroundColor?: string;
    opacity?: number;
  };
};

export type ImageOverlay = {
  source: ImageSource;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  opacity?: number;
  rotation?: number;
};

export type MapOverlay = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  markers: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
  }[];
  style?: {
    width: number;
    height: number;
    zoomLevel?: number;
  };
};

export type ComponentOverlay = {
  component: React.ComponentType<any>;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  props?: Record<string, any>;
};

export type ModifyImageOptions = {
  source: ImageSource;
  overlays?: {
    text?: TextOverlay[];
    images?: ImageOverlay[];
    maps?: MapOverlay[];
    components?: ComponentOverlay[];
  };
  outputFormat?: "jpeg" | "png";
  quality?: number;
};

export type ModifiedImageResult = {
  uri: string;
  width: number;
  height: number;
};

export type ExpoImageModifierModule = {
  modifyImage: (options: ModifyImageOptions) => Promise<ModifiedImageResult>;
  loadImage: (source: ImageSource) => Promise<ModifiedImageResult>;
};

export type OnLoadEventPayload = {
  url: string;
};

export type ExpoImageModifierModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type ExpoImageModifierViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
