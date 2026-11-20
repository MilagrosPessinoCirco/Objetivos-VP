export interface IDropdownOption {
  key: string;
  text: string;
  disabled?: boolean;
}

export interface IDropdownProps {
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
  className?: string;
  onChange?: (value: string | string[]) => void;
}
