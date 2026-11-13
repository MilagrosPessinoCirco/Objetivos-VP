import * as React from 'react';
import type { CSSProperties } from 'react';

import { Callout, Tooltip } from '../../../../../../core/ui/components';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../../shared/getColorStep';
import styles from './NombreAyuda.module.scss';

const NO_VISIBLE_LABEL = '';

const buildHelpIcon = (color: string): string => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4v.3M12 17h.01"/></svg>`;
	return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

const HELP_STYLE = { '--help-icon': buildHelpIcon(getColorStep('Primary', '500').value) } as CSSProperties;

const NombreAyuda: React.FC = () => (
	<span className={styles.help} style={HELP_STYLE}>
		<Tooltip content={strings.ObjetivoGuideAriaLabel}>
			<Callout
				title={strings.ObjetivoGuideTitle}
				description={strings.ObjetivoGuideText}
				showButtonLabel={NO_VISIBLE_LABEL}
				className={styles.guide}
				directionalHint="bottomCenter"
			>
				<React.Fragment />
			</Callout>
		</Tooltip>
	</span>
);

export default NombreAyuda;
