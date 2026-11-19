import * as React from 'react';

import { typography } from '../../../../../core/ui/foundations';
import { getColorStep } from '../getColorStep';
import { AvanceColor, formatAvance, getAvanceColor } from '../../Iniciativa/resultadoClaveUtils';

export interface IAvanceTextProps {
	value: number;
	spaced?: boolean;
}

const AVANCE_COLORS: Record<AvanceColor, string> = {
	rojo: getColorStep('Red', '600').value,
	amarillo: getColorStep('Yellow', '700').value,
	verde: getColorStep('Green', '700').value
};

const AvanceText: React.FC<IAvanceTextProps> = ({ value, spaced }) => (
	<b style={{ fontWeight: typography.weight.bold, color: AVANCE_COLORS[getAvanceColor(value)] }}>
		{`${formatAvance(value)}${spaced ? ' %' : '%'}`}
	</b>
);

export default AvanceText;
