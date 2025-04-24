import { registerWebModule, NativeModule } from "expo";

import { ExpoImageModifierModuleEvents } from "./ExpoImageModifier.types";

class ExpoImageModifierModule extends NativeModule<ExpoImageModifierModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }
}

export default registerWebModule(ExpoImageModifierModule);
