import * as React from 'react';
import { Callout as FluentCallout, DefaultButton, DirectionalHint, Link } from '@fluentui/react';
import styles from './Callout.module.scss';
import type { CalloutDirectionalHint, ICalloutProps } from './Callout.types';

const directionalHints: Record<CalloutDirectionalHint, DirectionalHint> = {
  bottomCenter: DirectionalHint.bottomCenter,
  topCenter: DirectionalHint.topCenter,
  leftCenter: DirectionalHint.leftCenter,
  rightCenter: DirectionalHint.rightCenter,
  bottomLeftEdge: DirectionalHint.bottomLeftEdge,
  bottomRightEdge: DirectionalHint.bottomRightEdge,
  topLeftEdge: DirectionalHint.topLeftEdge,
  topRightEdge: DirectionalHint.topRightEdge,
  leftTopEdge: DirectionalHint.leftTopEdge,
  leftBottomEdge: DirectionalHint.leftBottomEdge,
  rightTopEdge: DirectionalHint.rightTopEdge,
  rightBottomEdge: DirectionalHint.rightBottomEdge,
};

export const Callout: React.FC<ICalloutProps> = ({
  title,
  description,
  indicator = 'bottom',
  theme = 'light',
  darkMode = theme === 'dark',
  directionalHint,
  showLink = true,
  linkLabel = 'Sample link',
  showButtonLabel = 'Show callout',
  showButton = true,
  actionLabel = 'Aceptar',
  onAction,
  children,
  className,
}) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const legacyDirection: CalloutDirectionalHint = indicator === 'top'
    ? 'topCenter'
    : indicator === 'left'
      ? 'leftCenter'
      : indicator === 'right'
        ? 'rightCenter'
        : 'bottomCenter';
  const classNames = `${styles.callout} ${darkMode ? styles.dark : ''} ${className || ''}`;

  return (
    <span className={styles.anchor}>
      {showButton && (
        <DefaultButton
          className={styles.trigger}
          text={showButtonLabel}
          onClick={() => setIsOpen((open) => !open)}
          elementRef={(element) => setTarget(element as HTMLElement)}
          aria-expanded={isOpen}
        />
      )}
      {isOpen && target && (
        <FluentCallout
          className={classNames}
          target={target}
          directionalHint={directionalHints[directionalHint || legacyDirection]}
          gapSpace={0}
          beakWidth={20}
          doNotLayer
          role="status"
          onDismiss={() => setIsOpen(false)}
        >
          <div className={styles.body}>
            <p className={styles.title}>{title}</p>
            {description && <p className={styles.description}>{description}</p>}
            {children || (showLink ? (
              <Link className={styles.link} onClick={onAction}>{linkLabel}</Link>
            ) : (
              <DefaultButton className={styles.action} onClick={onAction}>{actionLabel}</DefaultButton>
            ))}
          </div>
        </FluentCallout>
      )}
    </span>
  );
};
