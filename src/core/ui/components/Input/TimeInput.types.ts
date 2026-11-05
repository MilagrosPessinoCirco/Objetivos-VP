import type { IInputProps } from './Input.types';

export interface ITimeInputProps extends Omit<IInputProps, 'type'> {
  value?: string;
  defaultValue?: string;
}
