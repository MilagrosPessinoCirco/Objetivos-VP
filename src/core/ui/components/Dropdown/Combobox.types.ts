import type { IDropdownOption } from './Dropdown.types';

export interface IComboboxProps {
  label: string;
  options: IDropdownOption[];
  placeholder?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  darkMode?: boolean;
  dividerAfter?: number[];
  onChange?: (value: string | string[]) => void;
  className?: string;
}
