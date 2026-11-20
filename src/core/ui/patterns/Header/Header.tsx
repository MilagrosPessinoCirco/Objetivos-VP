import * as React from 'react';
import { IconButton } from '@fluentui/react';
import { FigmaIcon } from '../../foundations/icons';
import { BrandLogo } from '../../foundations/brand';
import styles from './Header.module.scss';
import type { IHeaderProps, INativeHeaderProps } from './Header.types';

export const Header: React.FC<IHeaderProps> = ({
  color = 'blue',
  mobile = false,
  showLogo = true,
  logo,
  showMenu = true,
  menuIcon,
  menuAriaLabel = 'Abrir menú',
  onMenuClick,
  appIcon,
  separator = showLogo,
  title = 'logotipo',
  description = 'Descripción de la aplicación',
  showPlatformLogo = true,
  platformLogo,
  rightContent,
  actions,
  userName,
  userRole,
  className,
}) => (
  <header className={`${styles.header} ${styles[color]} ${mobile ? styles.mobile : ''} ${className || ''}`}>
    <div className={styles.main}>
      {showMenu && (
        <IconButton
          className={styles.menu}
          ariaLabel={menuAriaLabel}
          onClick={onMenuClick}
          onRenderIcon={() => <>{menuIcon || <FigmaIcon name="menu" size="md" className={styles.menuIcon} />}</>}
        />
      )}
      {separator && <span className={styles.divider} aria-hidden="true" />}
      <div className={styles.brandGroup}>
        {showLogo && (
          <div className={styles.brand}>
            {logo || (appIcon && <span className={styles.appIcon}>{appIcon}</span>)}
            {title && <span className={styles.title}>{title}</span>}
          </div>
        )}
        {separator && <span className={styles.divider2} aria-hidden="true" />}
        {description && <span className={styles.description}>{description}</span>}
      </div>
    </div>
    <div className={styles.right}>
      {showPlatformLogo && (
        <span className={styles.platform}>
          {platformLogo || <BrandLogo name="plataformas365" alt="by Plataformas 365 | IngSoft" height={19} />}
        </span>
      )}
      {rightContent}
      {actions}
      {!mobile && (userName || userRole) && (
        <div className={styles.user}>
          {userName && <span className={styles.userName}>{userName}</span>}
          {userRole && <span className={styles.userRole}>({userRole})</span>}
        </div>
      )}
    </div>
  </header>
);

export const NativeHeader: React.FC<INativeHeaderProps> = ({
  logo,
  search,
  actions,
  user,
  className,
  ...props
}) => (
  <header {...props} className={`${styles.header} ${styles.native} ${className || ''}`}>
    <div className={styles.main}>
      {logo || <strong className={styles.title}>YPF</strong>}
      <strong className={styles.title}>Sharepoint</strong>
    </div>
    <div className={styles.nativeSearch}>{search || 'Buscar en este sitio'}</div>
    <div className={`${styles.right} ${styles.nativeRight}`}>
      {actions}
      {user}
    </div>
  </header>
);
