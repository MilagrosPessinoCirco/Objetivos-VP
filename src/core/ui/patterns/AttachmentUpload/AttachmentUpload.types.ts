import type { ChangeEvent, ReactNode } from 'react';

export type AttachmentUploadVariant = 'modern' | 'classic';

export interface IAttachmentUploadProps {
  label?: string;
  files?: string[];
  defaultFiles?: string[];
  required?: boolean;
  readOnly?: boolean;
  darkMode?: boolean;
  variant?: AttachmentUploadVariant;
  emptyText?: string;
  uploadLabel?: string;
  onFilesChange?: (files: File[], names: string[]) => void;
  onRemove?: (fileName: string, index: number) => void;
  className?: string;
  children?: ReactNode;
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
