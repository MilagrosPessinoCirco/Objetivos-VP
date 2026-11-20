import * as React from 'react';
import styles from './HomeCards.module.scss';
import type { IHomeCardProps } from './HomeCards.types';

export const HomeCard: React.FC<IHomeCardProps> = ({
  type = 'simple',
  title,
  value,
  icon,
  details,
  actionLabel = 'Ver detalle',
  onAction,
  backgroundColor,
  textColor,
  className,
}) => {
  if (type === 'bandeja') {
    return (
      <div className={`${styles.card} ${styles.bandeja} ${className || ''}`}>
        <div className={styles.bandejaText}>
          <p className={styles.bandejaTitle}>{title}</p>
          {value && <p className={styles.bandejaValue}>{value}</p>}
          <button type="button" className={styles.textButton} onClick={onAction}>{actionLabel}</button>
        </div>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
    );
  }

  if (type === 'simpleButton' || type === 'detail') {
    return (
      <div className={`${styles.card} ${styles.raised} ${className || ''}`}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={`${styles.body} ${type === 'detail' ? styles.bodyDetail : ''}`}>
          {type === 'detail' && <p className={styles.raisedTitle}>{title}</p>}
          {type === 'detail' && details && <div className={styles.details}>{details}</div>}
          <div className={styles.compo}>
            {type === 'simpleButton' && <p className={styles.raisedTitleInline}>{title}</p>}
            <button type="button" className={styles.primaryButton} onClick={onAction}>{actionLabel}</button>
          </div>
        </div>
      </div>
    );
  }

  const simpleStyle: React.CSSProperties | undefined = backgroundColor || textColor
    ? { backgroundColor, color: textColor, borderColor: backgroundColor }
    : undefined;
  const interactiveProps = onAction
    ? {
      role: 'button',
      tabIndex: 0,
      onClick: onAction,
      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onAction();
        }
      },
    }
    : {};

  return (
    <div
      className={`${styles.card} ${styles.simple} ${onAction ? styles.interactive : ''} ${className || ''}`}
      style={simpleStyle}
      {...interactiveProps}
    >
      <div className={styles.simpleText}>
        <p className={styles.simpleTitle}>{title}</p>
        {value && <p className={styles.simpleValue}>{value}</p>}
      </div>
      {icon && <span className={styles.icon}>{icon}</span>}
    </div>
  );
};
