import * as React from 'react';
import { DefaultButton, IconButton } from '@fluentui/react';
import styles from './AttachmentUpload.module.scss';
import type { IAttachmentUploadProps } from './AttachmentUpload.types';

const attachModern: string = require('./assets/attach-modern.svg');
const attachClassic: string = require('./assets/attach-classic.svg');
const attachModernDark: string = require('./assets/attach-modern-dark.svg');
const attachClassicDark: string = require('./assets/attach-classic-dark.svg');
const closeIcon: string = require('./assets/close.svg');
const closeModernDark: string = require('./assets/close-modern-dark.svg');
const closeClassicDark: string = require('./assets/close-classic-dark.svg');

let generatedAttachmentId = 0;

export const AttachmentUpload: React.FC<IAttachmentUploadProps> = ({
  label = 'Datos adjuntos',
  files,
  defaultFiles = [],
  required = false,
  readOnly = false,
  darkMode = false,
  variant = 'modern',
  emptyText = 'No hay archivos.',
  uploadLabel = variant === 'classic' ? 'Adjuntar archivo' : 'Subir archivo',
  onFilesChange,
  onRemove,
  className,
  children,
  onInputChange,
}) => {
  const [internalFiles, setInternalFiles] = React.useState<string[]>(defaultFiles);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [inputId] = React.useState(() => {
    generatedAttachmentId += 1;
    return `ds-attachment-${generatedAttachmentId}`;
  });
  const currentFiles = files === undefined ? internalFiles : files;
  const attachIcon = variant === 'classic'
    ? darkMode ? attachClassicDark : attachClassic
    : darkMode ? attachModernDark : attachModern;
  const removeIcon = darkMode
    ? variant === 'classic' ? closeClassicDark : closeModernDark
    : closeIcon;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.prototype.slice.call(event.target.files || []) as File[];
    const acceptedFiles = variant === 'classic' ? selectedFiles.slice(0, Math.max(0, 1 - currentFiles.length)) : selectedFiles;
    const names = acceptedFiles.map((file) => file.name);
    if (files === undefined) {
      setInternalFiles([...currentFiles, ...names]);
    }
    onFilesChange?.(acceptedFiles, [...currentFiles, ...names]);
    onInputChange?.(event);
    event.target.value = '';
  };

  const handleRemove = (fileName: string, index: number): void => {
    if (files === undefined) {
      setInternalFiles(currentFiles.filter((_file, fileIndex) => fileIndex !== index));
    }
    onRemove?.(fileName, index);
  };

  const uploadAction = !readOnly && (
    <>
      <input
        ref={fileInputRef}
        id={inputId}
        className={styles.hiddenInput}
        type="file"
        multiple={variant === 'modern'}
        onChange={handleInputChange}
        aria-label={uploadLabel}
      />
      <DefaultButton
        className={styles.uploadButton}
        onClick={() => fileInputRef.current?.click()}
        onRenderIcon={() => <img className={styles.attachIcon} src={attachIcon} alt="" />}
        text={uploadLabel}
      />
    </>
  );

  const fileList = currentFiles.length > 0 ? (
    <div className={styles.fileList} aria-live="polite">
      {currentFiles.map((fileName, index) => (
        <div className={styles.fileRow} key={`${fileName}-${index}`}>
          <span className={styles.fileName}>{fileName}</span>
          {!readOnly && (
            <IconButton
              className={styles.remove}
              ariaLabel={`Quitar ${fileName}`}
              onClick={() => handleRemove(fileName, index)}
              onRenderIcon={() => <img src={removeIcon} alt="" />}
            />
          )}
        </div>
      ))}
    </div>
  ) : <span className={styles.emptyText}>{emptyText}</span>;

  return (
    <div className={`${styles.attachmentUpload} ${styles[variant]} ${darkMode ? styles.dark : ''} ${readOnly ? styles.readOnly : ''} ${currentFiles.length > 0 ? styles.hasFiles : ''} ${className || ''}`}>
      <label className={styles.label} htmlFor={inputId}>
        {label}{required && <span className={styles.required}> *</span>}
      </label>
      <div className={styles.inputArea}>
        {children || fileList}
        {variant === 'modern' && uploadAction}
      </div>
      {variant === 'classic' && currentFiles.length === 0 && uploadAction}
      {variant === 'classic' && currentFiles.length > 0 && !readOnly && (
        <div className={styles.maxFiles}>Máximo de archivos: 1</div>
      )}
    </div>
  );
};
