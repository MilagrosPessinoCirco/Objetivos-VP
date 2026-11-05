import * as React from 'react';

import { Surface } from '../../../../../core/ui/patterns';
import { colors, spacing, typography } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './WelcomeCard.module.scss';

const WELCOME_CARD_BORDER_RADIUS: number = 18;

const backgroundHome: string = require('../../../assets/backgroundHome.png');

const WelcomeCard: React.FC = () => {
	return (
		<Surface variant="raised" padding="spacious" borderRadius={WELCOME_CARD_BORDER_RADIUS}>
			<div className={styles.content}>
				<h2
					style={{
						fontFamily: typography.family.base,
						fontSize: typography.size[42],
						lineHeight: typography.lineHeight[42],
						fontWeight: typography.weight.semibold,
						color: colors.neutral.textMuted,
						margin: 0
					}}
				>
					{strings.HomeTitle}
				</h2>
				<p
					style={{
						fontFamily: typography.family.base,
						fontSize: typography.size[28],
						lineHeight: typography.lineHeight[28],
						fontWeight: typography.weight.regular,
						color: colors.neutral.textMuted,
						margin: 0,
						marginTop: spacing.lg
					}}
				>
					{strings.HomeWelcomeText}
				</p>
				<div className={styles.art} style={{ marginTop: spacing.xl }}>
					<img className={styles.illustration} src={backgroundHome} alt="" />
				</div>
			</div>
		</Surface>
	);
};

export default WelcomeCard;
