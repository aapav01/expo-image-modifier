import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoImageModifierViewProps } from './ExpoImageModifier.types';

const NativeView: React.ComponentType<ExpoImageModifierViewProps> =
  requireNativeView('ExpoImageModifier');

export default function ExpoImageModifierView(props: ExpoImageModifierViewProps) {
  return <NativeView {...props} />;
}
