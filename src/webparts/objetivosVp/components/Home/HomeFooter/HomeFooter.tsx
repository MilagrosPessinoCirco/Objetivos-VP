import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { BrandLogo, FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './HomeFooter.module.scss';

const BRAND_LOGO_HEIGHT: number = 19;

const HomeFooter: React.FC = () => {
	return (
		<div className={styles.footer} style={{ marginTop: spacing.lg }}>
			<BrandLogo name="plataformas365" alt={strings.BrandLogoAlt} height={BRAND_LOGO_HEIGHT} />
			<Button variant="secondary" iconRight={<FigmaIcon name="user" size="md" />}>
				{strings.UserManual}
			</Button>
		</div>
	);
};

export default HomeFooter;
