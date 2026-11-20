import * as React from 'react';
import { CompoundButton, DefaultButton, IconButton, PrimaryButton } from '@fluentui/react';
import styles from './Button.module.scss';
import type { IButtonProps } from './Button.types';

const contextualPlaceholder: string = require('./assets/contextual-placeholder.svg');

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(({
  children,
  variant = 'primary',
  size = 'default',
  color = 'blue',
  darkMode = false,
  buttonType = 'standard',
  secondaryText,
  iconLeft,
  iconRight,
  iconOnly = false,
  circular = false,
  split = false,
  menuItems,
  onSplitClick,
  className,
  type = 'button',
  ...buttonProps
}, ref) => {
  const isContextualMenu = buttonType === 'contextualMenu';
  const isSplit = split || buttonType === 'split' || buttonType === 'iconSplit' || isContextualMenu;
  const hasMenu = isSplit;
  const isIconButton = iconOnly || buttonType === 'icon';
  const splitShapeClass = buttonType === 'iconSplit' ? `${styles.iconOnly} ${styles.iconSplit}` : '';
  const contextualMenuClass = isContextualMenu ? styles.contextualMenu : '';
  const classNames = [
    styles.button,
    styles[variant],
    variant === 'compound' ? styles.primary : '',
    styles[color],
    darkMode ? styles.dark : '',
    size === 'small' ? styles.small : '',
    buttonType === 'icon' ? styles.iconButton : '',
    isIconButton || buttonType === 'iconSplit' ? styles.iconOnly : '',
    circular ? styles.circular : '',
    isSplit ? styles.split : '',
    contextualMenuClass,
    className || '',
  ].filter(Boolean).join(' ');

  if (isIconButton) {
    return (
      <IconButton
        {...buttonProps}
        elementRef={ref as React.Ref<HTMLElement>}
        type={type}
        className={classNames}
        disabled={buttonProps.disabled}
        onRenderIcon={() => <span className={styles.icon}>{iconLeft || iconRight}</span>}
      />
    );
  }

  if (variant === 'compound') {
    return (
      <CompoundButton
        {...buttonProps}
        elementRef={ref as React.Ref<HTMLElement>}
        type={type}
        className={classNames}
        styles={{
          root: styles.compoundRoot,
          flexContainer: styles.compoundFlexContainer,
        }}
      >
        {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
        <span className={styles.compoundContent}>
          <span className={styles.compoundLabel}>{children}</span>
          {secondaryText && <span className={darkMode ? styles.compoundDescriptionDark : styles.compoundDescription}>{secondaryText}</span>}
        </span>
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </CompoundButton>
    );
  }

  const FluentButton = variant === 'primary' ? PrimaryButton : DefaultButton;

  return (
    <FluentButton
      {...buttonProps}
      elementRef={ref as React.Ref<HTMLElement>}
      type={type}
      className={classNames}
      split={isSplit}
      menuProps={hasMenu ? { items: menuItems || [] } : undefined}
      onClick={isSplit ? buttonProps.onClick || (() => undefined) : buttonProps.onClick}
      splitButtonAriaLabel="Abrir opciones"
      splitButtonMenuProps={{
        className: `${styles.splitMenu} ${styles[variant]} ${styles[color]} ${contextualMenuClass} ${darkMode ? styles.dark : ''}`,
        onRenderIcon: () => <span className={styles.splitChevron} aria-hidden="true" />,
      }}
      onMenuClick={(event) => {
        event?.preventDefault();
        onSplitClick?.();
      }}
      styles={isSplit ? {
        splitButtonContainer: `${styles.splitButtonContainer} ${styles[variant]} ${styles[color]} ${contextualMenuClass} ${darkMode ? styles.dark : ''} ${splitShapeClass}`,
        splitButtonMenuButton: `${styles.splitButtonMenuButton} ${styles[variant]} ${styles[color]} ${contextualMenuClass} ${darkMode ? styles.dark : ''} ${splitShapeClass}`,
        splitButtonDivider: `${styles.splitButtonDivider} ${styles[variant]} ${styles[color]} ${contextualMenuClass} ${darkMode ? styles.dark : ''} ${splitShapeClass}`,
      } : undefined}
    >
      <span className={styles.content}>
        {(iconLeft || isContextualMenu) && (
          <span className={`${styles.icon} ${isContextualMenu ? styles.contextualIcon : ''}`}>
            {iconLeft || <img src={contextualPlaceholder} alt="" />}
          </span>
        )}
        <span className={isContextualMenu ? styles.contextualLabel : ''}>{children}</span>
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </span>
    </FluentButton>
  );
});

Button.displayName = 'Button';
