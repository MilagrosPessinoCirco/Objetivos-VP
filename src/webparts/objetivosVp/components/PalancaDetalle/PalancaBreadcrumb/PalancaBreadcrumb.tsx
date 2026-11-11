import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@fluentui/react';
import type { IBreadcrumbItem, IBreadcrumbStyles, IDividerAsProps } from '@fluentui/react';

import { colors, typography } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../getColorStep';
import { HOME_PATH, PALANCAS_PATH, getPalancaPath } from '../../ObjetivosVp/routes';

export interface IPalancaBreadcrumbProps {
	palancaNombre?: string;
	palancaId?: number;
	objetivoNombre?: string;
}

const BREADCRUMB_DIVIDER = '›';

const Divider: React.FC<IDividerAsProps> = () => <span aria-hidden="true">{BREADCRUMB_DIVIDER}</span>;

const BREADCRUMB_STYLES: Partial<IBreadcrumbStyles> = {
	root: { margin: 0 },
	listItem: {
		fontFamily: typography.family.base,
		fontSize: typography.size[12],
		lineHeight: typography.lineHeight[12],
		color: colors.neutral.textMuted
	},
	itemLink: {
		fontFamily: typography.family.base,
		fontSize: typography.size[12],
		lineHeight: typography.lineHeight[12],
		fontWeight: typography.weight.semibold,
		color: colors.brand.primary,
		textDecoration: 'underline'
	},
	item: {
		fontFamily: typography.family.base,
		fontSize: typography.size[12],
		lineHeight: typography.lineHeight[12],
		fontWeight: typography.weight.bold,
		color: getColorStep('Primary', '800').value
	}
};

const PalancaBreadcrumb: React.FC<IPalancaBreadcrumbProps> = ({ palancaNombre, palancaId, objetivoNombre }) => {
	const navigate = useNavigate();

	const items: IBreadcrumbItem[] = [
		{ key: 'home', text: strings.BreadcrumbHome, onClick: () => navigate(HOME_PATH) },
		{ key: 'palancas', text: strings.BreadcrumbPalancas, onClick: () => navigate(PALANCAS_PATH) }
	];
	if (objetivoNombre) {
		if (palancaNombre && palancaId !== undefined) {
			items.push({ key: 'palanca', text: palancaNombre, onClick: () => navigate(getPalancaPath(palancaId)) });
		}
		items.push({ key: 'current', text: objetivoNombre, isCurrentItem: true });
	}
	else if (palancaNombre) {
		items.push({ key: 'current', text: palancaNombre, isCurrentItem: true });
	}

	return <Breadcrumb items={items} ariaLabel={strings.BreadcrumbAriaLabel} dividerAs={Divider} styles={BREADCRUMB_STYLES} />;
};

export default PalancaBreadcrumb;
