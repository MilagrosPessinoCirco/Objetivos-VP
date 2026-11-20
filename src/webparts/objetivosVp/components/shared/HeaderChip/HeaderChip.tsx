import * as React from 'react';
import type { CSSProperties } from 'react';

import { Chip } from '../../../../../core/ui/patterns';
import type { ChipColor } from '../../../../../core/ui/patterns';
import styles from './HeaderChip.module.scss';

export interface IHeaderChipProps {
	label: string;
	color: ChipColor;
	textColor?: string;
}

const HeaderChip: React.FC<IHeaderChipProps> = ({ label, color, textColor }) => {
	const style: CSSProperties | undefined = textColor ? { color: textColor } : undefined;
	return (
		<span style={style}>
			<Chip size="small" className={textColor ? `${styles.chip} ${styles.inheritColor}` : styles.chip} clickable={false} color={color} label={label} />
		</span>
	);
};

export default HeaderChip;
