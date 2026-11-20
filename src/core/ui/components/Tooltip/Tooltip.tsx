import * as React from 'react';
import { DirectionalHint, TooltipHost } from '@fluentui/react';
import styles from './Tooltip.module.scss';
import type { ITooltipProps } from './Tooltip.types';

let generatedTooltipId = 0;

export const Tooltip: React.FC<ITooltipProps> = ({
  content,
  children,
  position = 'bottom',
  darkMode = false,
  disabled = false,
  className,
}) => {
  const [tooltipId] = React.useState(() => {
    generatedTooltipId += 1;
    return `ds-tooltip-${generatedTooltipId}`;
  });

  if (disabled) {
    return <>{children}</>;
  }

  const directionalHint = {
    top: DirectionalHint.topCenter,
    right: DirectionalHint.rightCenter,
    bottom: DirectionalHint.bottomCenter,
    left: DirectionalHint.leftCenter,
  }[position];

  return (
    <TooltipHost
      id={tooltipId}
      content={content as string | React.ReactElement | React.ReactElement[]}
      directionalHint={directionalHint}
      hostClassName={`${styles.tooltip} ${className || ''}`}
      className={`${styles.content} ${darkMode ? styles.darkTooltip : ''}`}
      calloutProps={{
        gapSpace: 8,
        beakWidth: 8,
        className: darkMode ? styles.darkCallout : undefined,
      }}
      delay={0}
    >
      {children}
    </TooltipHost>
  );
};
