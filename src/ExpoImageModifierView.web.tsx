import * as React from 'react';

import { ExpoImageModifierViewProps } from './ExpoImageModifier.types';

export default function ExpoImageModifierView(props: ExpoImageModifierViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
