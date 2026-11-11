import type { CSSProperties } from 'react';

import { typography } from '../../../../core/ui/foundations';
import { getColorStep } from '../getColorStep';

export const PAGE_TITLE_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[20],
	lineHeight: typography.lineHeight[20],
	fontWeight: typography.weight.regular,
	color: getColorStep('Primary', '800').value,
	margin: 0
};
