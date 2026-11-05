import * as React from 'react';
import styles from './ColorSwatch.module.scss';
import type { IColorSwatchProps } from './ColorSwatch.types';

export const ColorSwatch: React.FC<IColorSwatchProps> = ({
  name,
  scale,
  value,
  textColor,
}) => (
  <div
    className={styles.swatch}
    style={{
      '--ds-swatch-color': value,
      '--ds-swatch-text-color': textColor,
    } as React.CSSProperties}
  >
    <div className={styles.details}>
      <strong className={styles.name}>{name}</strong>
      {scale && <strong className={styles.scale}>{scale}</strong>}
    </div>
    <strong className={styles.value}>{value}</strong>
  </div>
);
