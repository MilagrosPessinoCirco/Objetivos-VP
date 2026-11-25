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

export interface ILocationButtonProps {
	onClick: () => void;
	buttonRef?: React.Ref<HTMLButtonElement>;
}

const LocationButton: React.FC<ILocationButtonProps> = ({ onClick, buttonRef }) => (
	<Button
		variant="primary"
		className={styles.location}
		style={LOCATION_BUTTON_STYLE}
		iconLeft={<FigmaIcon name="chevronDoubleDown" size="sm" className={styles.whiteIcon} />}
		onClick={onClick}
		ref={buttonRef}
	>
		{strings.PalancaLocationButton}
	</Button>
);

export default LocationButton;
