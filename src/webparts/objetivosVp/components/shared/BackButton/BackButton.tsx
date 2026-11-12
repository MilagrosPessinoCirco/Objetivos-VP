import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button } from '../../../../../core/ui/components';
import { FigmaIcon } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './BackButton.module.scss';

export interface IBackButtonProps {
	onClick: () => void;
}

const BACK_STYLE: CSSProperties = { border: 'none', background: 'transparent' };

const BackButton: React.FC<IBackButtonProps> = ({ onClick }) => (
	<Button variant="secondary" size="small" className={styles.back} style={BACK_STYLE} onClick={onClick}>
		<span className={styles.content}>
			<span className={styles.circle}>
				<FigmaIcon name="arrowCircle" size="lg" className={styles.icon} />
			</span>
			{strings.Back}
		</span>
	</Button>
);

export default BackButton;
