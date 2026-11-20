import type { ReactNode } from 'react';

export type SwitchLabelPosition = 'top' | 'inlineRight' | 'inlineLeft';

export interface ISwitchProps {
  label?: ReactNode;
  active?: boolean;
  defaultActive?: boolean;
  labelPosition?: SwitchLabelPosition;
  textOff?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  onChange?: (active: boolean) => void;
  className?: string;
}
