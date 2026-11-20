import type { ReactNode } from 'react';

export interface IPeopleSuggestionProps {
  name: string;
  secondaryText?: string;
  avatarSrc?: string;
  avatarIcon?: ReactNode;
  initials?: string;
  selected?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  className?: string;
  onSelect?: () => void;
}
