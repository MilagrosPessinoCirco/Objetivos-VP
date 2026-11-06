import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './HomeFooter.module.scss';

const HomeFooter: React.FC = () => {
	return (
		<div className={styles.footer} style={{ marginTop: spacing.lg }}>
			<Button variant="secondary" iconRight={<FigmaIcon name="user" size="md" />}>
				{strings.UserManual}
			</Button>
		</div>
	);
};

export default HomeFooter;
