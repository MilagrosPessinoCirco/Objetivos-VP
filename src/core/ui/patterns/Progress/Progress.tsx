import * as React from 'react';
import { ProgressIndicator, Spinner as FluentSpinner, SpinnerLabelPosition as FluentSpinnerLabelPosition, SpinnerSize } from '@fluentui/react';
import styles from './Progress.module.scss';
import type { IProgressBarProps, ISpinnerProps } from './Progress.types';

export const Spinner: React.FC<ISpinnerProps> = ({
  text = 'I am definitely loading...',
  labelPosition = 'above',
  darkMode = false,
  icon,
  className,
}) => {
  const fluentLabelPosition: FluentSpinnerLabelPosition = labelPosition === 'above'
    ? 'top'
    : labelPosition === 'below'
      ? 'bottom'
      : labelPosition;

  return (
    <div className={`${styles.spinner} ${styles[labelPosition]} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      {icon || (
        <FluentSpinner
          size={SpinnerSize.large}
          label={text}
          labelPosition={fluentLabelPosition}
          ariaLabel={text}
          styles={{
            root: styles.fluentSpinnerRoot,
            circle: styles.fluentSpinnerCircle,
            label: styles.fluentSpinnerLabel,
          }}
        />
      )}
    </div>
  );
};

export const ProgressBar: React.FC<IProgressBarProps> = ({
  title = 'Example title',
  description = 'Example description',
  value = 30,
  darkMode = false,
  className,
}) => {
  const boundedValue = Math.min(100, Math.max(0, value));
  return (
    <ProgressIndicator
      className={`${styles.progress} ${darkMode ? styles.dark : ''} ${className || ''}`}
      label={title}
      description={description}
      percentComplete={boundedValue / 100}
      barHeight={2}
      styles={{
        root: styles.fluentProgressRoot,
        itemName: styles.fluentProgressTitle,
        itemDescription: styles.fluentProgressDescription,
        itemProgress: styles.fluentProgressTrackWrapper,
        progressTrack: styles.fluentProgressTrack,
        progressBar: styles.fluentProgressValue,
      }}
    />
  );
};
