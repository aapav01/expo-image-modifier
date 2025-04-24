import { NativeModule, requireNativeModule } from "expo";

import { ExpoImageModifierModuleEvents } from "./ExpoImageModifier.types";

declare class ExpoImageModifierModule extends NativeModule<ExpoImageModifierModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoImageModifierModule>(
  "ExpoImageModifier",
);
