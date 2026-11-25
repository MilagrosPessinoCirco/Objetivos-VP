import * as React from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@fluentui/react';
import type { ILinkStyles } from '@fluentui/react';

import { typography } from '../../../../../../core/ui/foundations';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../getColorStep';
import type { INivel } from '../ubicacionUtils';
import styles from './UbicacionNivel.module.scss';

export interface IUbicacionNivelProps {
	nivel: INivel;
	onNavigate: (path: string) => void;
}

const MAX_ITEMS_COLAPSADO = 3;

const NEUTRAL_MUTED = getColorStep('Neutral', '600').value;
const LINK_COLOR = getColorStep('Primary', '500').value;
const LINK_COLOR_ACTIVE = getColorStep('Primary', '600').value;

export const UBICACION_COLOR_VARS = {
	'--ubi-dark': getColorStep('Primary', '800').value,
	'--ubi-dot': getColorStep('Primary', '100').value,
	'--ubi-white': getColorStep('Neutral', '50').value
} as CSSProperties;

const TITULO_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: NEUTRAL_MUTED,
	marginBottom: 2
};

const ITEM_ACTUAL_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14],
	fontWeight: typography.weight.bold,
	color: getColorStep('Primary', '800').value
};

const VACIO_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: NEUTRAL_MUTED
};

const buildLinkStyles = (size: string, lineHeight: string): Partial<ILinkStyles> => ({
	root: {
		fontFamily: typography.family.base,
		fontSize: size,
		lineHeight,
		fontWeight: typography.weight.semibold,
		color: LINK_COLOR,
		textAlign: 'left',
		selectors: {
			':hover': { color: LINK_COLOR, textDecoration: 'underline' },
			':active': { color: LINK_COLOR_ACTIVE }
		}
	}
});

const ITEM_LINK_STYLES = buildLinkStyles(typography.size[14], typography.lineHeight[14]);
const TOGGLE_LINK_STYLES = buildLinkStyles(typography.size[12], typography.lineHeight[12]);

const UbicacionNivel: React.FC<IUbicacionNivelProps> = ({ nivel, onNavigate }) => {
	const [expandido, setExpandido] = React.useState<boolean>(false);
	const tituloId = `ubicacion-nivel-${nivel.key}`;
	const visibles = expandido ? nivel.items : nivel.items.slice(0, MAX_ITEMS_COLAPSADO);
	const restantes = nivel.items.length - MAX_ITEMS_COLAPSADO;

	const renderItem = (key: string, label: string, path: string | undefined): React.ReactNode => (
		<li key={key}>
			{path !== undefined
				? <Link styles={ITEM_LINK_STYLES} onClick={() => onNavigate(path)}>{label}</Link>
				: <span style={ITEM_ACTUAL_STYLE} aria-current={nivel.actual ? 'true' : undefined}>{label}</span>}
		</li>
	);

	return (
		<li className={styles.nivel} style={UBICACION_COLOR_VARS}>
			<span className={nivel.actual ? styles.dotActual : styles.dot} aria-hidden="true" />
			<span id={tituloId} style={TITULO_STYLE}>{nivel.titulo}</span>
			{nivel.items.length === 0
				? <span style={VACIO_STYLE}>{strings.UbicacionVacio}</span>
				: <ul className={styles.items} aria-labelledby={tituloId}>
					{visibles.map((item) => renderItem(item.key, item.label, item.path))}
				</ul>}
			{restantes > 0 && (
				<Link styles={TOGGLE_LINK_STYLES} aria-expanded={expandido} onClick={() => setExpandido(!expandido)}>
					{expandido ? strings.UbicacionVerMenos : Utils.replaceAll(strings.UbicacionVerMas, '{0}', String(restantes))}
				</Link>
			)}
		</li>
	);
};

export default UbicacionNivel;
