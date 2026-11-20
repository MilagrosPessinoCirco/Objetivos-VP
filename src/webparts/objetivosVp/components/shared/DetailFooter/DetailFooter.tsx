import * as React from 'react';

import { spacing } from '../../../../../core/ui/foundations';
import styles from './DetailFooter.module.scss';

export interface IDetailFooterProps {
	children: React.ReactNode;
}

const DetailFooter: React.FC<IDetailFooterProps> = ({ children }) => (
	<div className={styles.footer} style={{ gap: spacing.lg }}>
		{children}
	</div>
);

export default DetailFooter;
