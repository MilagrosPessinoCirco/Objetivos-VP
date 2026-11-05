import * as React from 'react';
import { Input } from './Input';
import type { ITimeInputProps } from './TimeInput.types';

export const TimeInput = React.forwardRef<HTMLInputElement, ITimeInputProps>((props, ref) => (
  <Input
    {...props}
    ref={ref}
    type="time"
    aria-label={props['aria-label'] || props.label || 'Hora'}
  />
));

TimeInput.displayName = 'TimeInput';
