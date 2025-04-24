import { NativeModule, requireNativeModule } from "expo";

import {
  ExpoImageModifierModule as ExpoImageModifierModuleType,
  ModifyImageOptions,
  ModifiedImageResult,
  ImageSource,
} from "./ExpoImageModifier.types";

declare class ExpoImageModifierModule extends NativeModule {
  /**
   * Modifies an image with the specified overlays and options
   * @param options The modification options including source image and overlays
   * @returns A promise that resolves to the modified image result
   */
  modifyImage(options: ModifyImageOptions): Promise<ModifiedImageResult>;

  /**
   * Loads an image from various sources (URI, base64, or local path)
   * @param source The image source to load
   * @returns A promise that resolves to the loaded image result
   */
  loadImage(source: ImageSource): Promise<ModifiedImageResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoImageModifierModule>(
  "ExpoImageModifier"
) as ExpoImageModifierModuleType;
