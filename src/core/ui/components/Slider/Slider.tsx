import * as React from 'react';
import { Slider as FluentSlider } from '@fluentui/react';
import styles from './Slider.module.scss';
import type { ISliderProps, SliderValue } from './Slider.types';

function isRangeValue(value: SliderValue): value is [number, number] {
  return Array.isArray(value);
}

export const Slider: React.FC<ISliderProps> = ({
  label,
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  direction = 'horizontal',
  disabled = false,
  darkMode = false,
  onChange,
  className,
}) => {
  const ranged = isRangeValue(value === undefined ? defaultValue : value);
  const currentValue = value === undefined ? undefined : (isRangeValue(value) ? value[1] : value);
  const currentLowerValue = value === undefined ? undefined : (isRangeValue(value) ? value[0] : undefined);
  const defaultUpperValue = isRangeValue(defaultValue) ? defaultValue[1] : defaultValue;
  const defaultLowerValue = isRangeValue(defaultValue) ? defaultValue[0] : undefined;

  const handleChange = (nextValue: number, range?: [number, number]): void => {
    onChange?.(ranged && range ? range : nextValue);
  };

  return (
    <FluentSlider
      className={`${styles.slider} ${darkMode ? styles.dark : ''} ${className || ''}`}
      label={typeof label === 'string' ? label : undefined}
      ranged={ranged}
      vertical={direction === 'vertical'}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={currentValue}
      defaultValue={defaultUpperValue}
      lowerValue={currentLowerValue}
      defaultLowerValue={defaultLowerValue}
      onChange={handleChange}
      styles={{
        root: styles.root,
        titleLabel: styles.titleLabel,
        container: styles.container,
        slideBox: styles.slideBox,
        line: styles.line,
        lineContainer: styles.lineContainer,
        activeSection: styles.activeSection,
        inactiveSection: styles.inactiveSection,
        thumb: styles.thumb,
        valueLabel: styles.valueLabel,
      }}
    />
  );
};

