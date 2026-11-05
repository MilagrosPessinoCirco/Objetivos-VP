import * as React from 'react';
import { Rating as FluentRating, RatingSize as FluentRatingSize } from '@fluentui/react';
import type { IRatingStarProps } from '@fluentui/react';
import styles from './Rating.module.scss';
import type { IRatingProps } from './Rating.types';

let generatedRatingId = 0;

export const Rating: React.FC<IRatingProps> = ({
  label,
  required = false,
  rating,
  defaultRating = 0,
  max = 5,
  size = 'large',
  disabled = false,
  readOnly = false,
  darkMode = false,
  ariaLabel,
  ariaLabelFormat = 'Valoración {0} de {1}',
  id,
  className,
  onChange,
}) => {
  const [generatedId] = React.useState(() => {
    generatedRatingId += 1;
    return `ds-rating-${generatedRatingId}`;
  });
  const labelId = `${id || generatedId}-label`;
  const interactive = !disabled && !readOnly;

  const rootClasses = [
    styles.rating,
    size === 'small' ? styles.small : styles.large,
    darkMode ? styles.dark : '',
    disabled ? styles.disabled : '',
    interactive ? styles.interactive : '',
    className || '',
  ].filter(Boolean).join(' ');

  const renderStar = (starProps?: IRatingStarProps): React.ReactElement | null => {
    if (!starProps) {
      return null;
    }
    const { classNames, fillPercentage } = starProps;
    return (
      <div className={classNames.ratingStar}>
        <span className={`${classNames.ratingStarBack} ${fillPercentage === 100 ? styles.solid : styles.line}`} />
        {!starProps.disabled && (
          <span className={`${classNames.ratingStarFront} ${styles.solid}`} style={{ width: `${fillPercentage}%` }} />
        )}
      </div>
    );
  };

  return (
    <div className={rootClasses}>
      {label && (
        <span className={styles.label} id={labelId}>
          <span>{label}</span>
          {required && <span className={styles.required}>*</span>}
        </span>
      )}
      <FluentRating
        rating={rating}
        defaultRating={rating === undefined ? defaultRating : undefined}
        allowZeroStars
        max={max}
        size={size === 'small' ? FluentRatingSize.Small : FluentRatingSize.Large}
        disabled={disabled}
        readOnly={readOnly}
        ariaLabel={ariaLabel}
        ariaLabelFormat={ariaLabelFormat}
        aria-labelledby={label ? labelId : undefined}
        onChange={(_event, value) => onChange?.(value === undefined ? 0 : value)}
        onRenderStar={renderStar}
        styles={{
          root: styles.root,
          rootIsLarge: styles.rootLarge,
          rootIsSmall: styles.rootSmall,
          ratingFocusZone: styles.focusZone,
          ratingButton: styles.button,
          ratingStar: styles.star,
          ratingStarBack: styles.back,
          ratingStarFront: styles.front,
        }}
      />
    </div>
  );
};
