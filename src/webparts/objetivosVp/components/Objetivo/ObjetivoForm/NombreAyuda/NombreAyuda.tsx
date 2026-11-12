import * as React from 'react';

import { Callout, Tooltip } from '../../../../../../core/ui/components';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './NombreAyuda.module.scss';

const HELP_SYMBOL = '?';

const NombreAyuda: React.FC = () => (
	<span className={styles.help}>
		<Tooltip content={strings.ObjetivoGuideAriaLabel}>
			<Callout
				title={strings.ObjetivoGuideTitle}
				description={strings.ObjetivoGuideText}
				showButtonLabel={HELP_SYMBOL}
				indicator="top"
			>
				<React.Fragment />
			</Callout>
		</Tooltip>
	</span>
);

export default NombreAyuda;
