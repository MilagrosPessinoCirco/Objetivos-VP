import * as React from 'react';

import { Surface } from '../../../../../core/ui/patterns';
import { colors, typography } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './WelcomeCard.module.scss';

const WELCOME_CARD_BORDER_RADIUS: number = 18;
// Los textos se achican cuando la ventana es baja o angosta, para que la home entre sin scroll.
const TITLE_FONT_SIZE: string = 'clamp(20px, min(4.8vh, 2.2vw), 30px)';
const TITLE_LINE_HEIGHT: number = 1.3;
const SUBTITLE_FONT_SIZE: string = 'clamp(14px, min(3vh, 1.35vw), 18px)';
const SUBTITLE_LINE_HEIGHT: number = 1.4;
const TEXT_GAP: string = 'clamp(8px, 2.5vh, 16px)';

const backgroundHome: string = require('../../../assets/backgroundHome.png');

const WelcomeCard: React.FC = () => {
	return (
		<Surface variant="raised" padding="spacious" borderRadius={WELCOME_CARD_BORDER_RADIUS} className={styles.surface}>
			<div className={styles.content}>
				<h2
					style={{
						fontFamily: typography.family.base,
						fontSize: TITLE_FONT_SIZE,
						lineHeight: TITLE_LINE_HEIGHT,
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
						fontSize: SUBTITLE_FONT_SIZE,
						lineHeight: SUBTITLE_LINE_HEIGHT,
						fontWeight: typography.weight.regular,
						color: colors.neutral.textMuted,
						margin: 0,
						marginTop: TEXT_GAP
					}}
				>
					{strings.HomeWelcomeText}
				</p>
				<div className={styles.art} style={{ marginTop: TEXT_GAP }}>
					<img className={styles.illustration} src={backgroundHome} alt="" />
				</div>
			</div>
		</Surface>
	);
};

export default WelcomeCard;
