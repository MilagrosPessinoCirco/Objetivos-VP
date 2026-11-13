import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button } from '../../../../../core/ui/components';
import { FigmaIcon } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../getColorStep';
import styles from './LocationButton.module.scss';

const LOCATION_BUTTON_STYLE = {
	'--location-bg': getColorStep('Tertiary', '600').value,
	'--location-bg-hover': getColorStep('Tertiary', '700').value
} as CSSProperties;

const LocationButton: React.FC = () => (
	<Button
		variant="primary"
		className={styles.location}
		style={LOCATION_BUTTON_STYLE}
		iconLeft={<FigmaIcon name="chevronDown" className={styles.whiteIcon} />}
	>
		{strings.PalancaLocationButton}
	</Button>
);

export default LocationButton;
