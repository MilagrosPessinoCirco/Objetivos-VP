import type { ReactNode } from 'react';

export type SliderDirection = 'horizontal' | 'vertical';
export type SliderValue = number | [number, number];

export interface ISliderProps {
  label?: ReactNode;
  value?: SliderValue;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  direction?: SliderDirection;
  disabled?: boolean;
  darkMode?: boolean;
  onChange?: (value: SliderValue) => void;
  className?: string;
}
