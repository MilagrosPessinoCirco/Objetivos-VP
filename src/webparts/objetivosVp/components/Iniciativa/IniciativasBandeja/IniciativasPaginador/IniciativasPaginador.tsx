import * as React from 'react';
import type { CSSProperties } from 'react';

import { Tooltip } from '../../../../../../core/ui/components';
import { spacing, typography } from '../../../../../../core/ui/foundations';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../../shared/getColorStep';
import styles from './IniciativasPaginador.module.scss';

export interface IIniciativasPaginadorProps {
	page: number;
	pageSize: number;
	total: number;
	inline?: boolean;
	onPageChange: (page: number) => void;
}

const FIRST_PAGE = 1;
const ICON_PATH_FIRST = 'M17 17l-5-5 5-5M11 17l-5-5 5-5';
const ICON_PATH_PREVIOUS = 'M14 17l-5-5 5-5';
const ICON_PATH_NEXT = 'M10 7l5 5-5 5';
const ICON_PATH_LAST = 'M7 7l5 5-5 5M13 7l5 5-5 5';

const INFO_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: getColorStep('Neutral', '600').value
};

const IniciativasPaginador: React.FC<IIniciativasPaginadorProps> = ({ page, pageSize, total, inline, onPageChange }) => {
	if (total <= pageSize) {
		return null;
	}

	const lastPage = Math.ceil(total / pageSize);
	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);
	const info = Utils.replaceAll(Utils.replaceAll(Utils.replaceAll(strings.IniciativasPageInfo, '{0}', String(from)), '{1}', String(to)), '{2}', String(total));
	const pages = Array.from({ length: lastPage }, (_, index) => index + FIRST_PAGE);
	const isFirst = page === FIRST_PAGE;
	const isLast = page === lastPage;

	const renderArrow = (label: string, target: number, disabled: boolean, iconPath: string): React.ReactNode => (
		<Tooltip content={label}>
			<button type="button" className={styles.arrow} disabled={disabled} aria-label={label} onClick={() => onPageChange(target)}>
				<svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath} /></svg>
			</button>
		</Tooltip>
	);

	return (
		<nav className={inline ? `${styles.pager} ${styles.inline}` : styles.pager} style={{ gap: spacing.md }} aria-label={strings.IniciativasPagerAriaLabel}>
			<span className={styles.info} style={INFO_STYLE}>{info}</span>
			<div className={styles.buttons} style={{ gap: spacing.xs }}>
				{renderArrow(strings.IniciativasPageFirst, FIRST_PAGE, isFirst, ICON_PATH_FIRST)}
				{renderArrow(strings.IniciativasPagePrevious, page - 1, isFirst, ICON_PATH_PREVIOUS)}
				{pages.map((number) => (
					<button
						key={number}
						type="button"
						className={number === page ? `${styles.number} ${styles.current}` : styles.number}
						aria-current={number === page ? 'page' : undefined}
						aria-label={Utils.replaceAll(strings.IniciativasPageNumber, '{0}', String(number))}
						onClick={() => onPageChange(number)}
					>
						{String(number)}
					</button>
				))}
				{renderArrow(strings.IniciativasPageNext, page + 1, isLast, ICON_PATH_NEXT)}
				{renderArrow(strings.IniciativasPageLast, lastPage, isLast, ICON_PATH_LAST)}
			</div>
		</nav>
	);
};

export default IniciativasPaginador;
