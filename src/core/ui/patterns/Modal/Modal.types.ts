import type { ReactNode } from 'react';

export type ModalVariant = 'default' | 'oneSlot' | 'twoSlots';

export interface IModalProps {
  open: boolean;
  title?: string;
  description?: string;
  variant?: ModalVariant;
  darkMode?: boolean;
  children?: ReactNode;
  secondaryContent?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  className?: string;
}
