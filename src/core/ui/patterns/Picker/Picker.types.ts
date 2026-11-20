import type { ReactNode } from 'react';

export type PickerMode = 'date' | 'people';

export interface IPersonOption {
  key: string;
  name: string;
  secondaryText?: string;
  avatar?: ReactNode;
}

export interface IPickerProps {
  mode: PickerMode;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  people?: IPersonOption[];
  selectedPeople?: IPersonOption[];
  defaultSelectedPeople?: IPersonOption[];
  open?: boolean;
  darkMode?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onPersonSelect?: (person: IPersonOption) => void;
  onSelectedPeopleChange?: (people: IPersonOption[]) => void;
  className?: string;
}
