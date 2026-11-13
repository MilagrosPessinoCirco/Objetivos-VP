import * as React from 'react';

import { typography } from '../../../../core/ui/foundations';
import { getColorStep } from './getColorStep';

const SUBTITLE_STYLE: React.CSSProperties = {
	display: 'block',
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	fontWeight: typography.weight.regular,
	color: getColorStep('Neutral', '600').value
};

// El Panel del Design System tipa title como string, pero Fluent renderiza cualquier nodo en el encabezado.
export const buildPanelTitle = (title: string, subtitle?: string): string => (
	<>
		{title}
		{subtitle && <span style={SUBTITLE_STYLE}>{subtitle}</span>}
	</>
) as unknown as string;
