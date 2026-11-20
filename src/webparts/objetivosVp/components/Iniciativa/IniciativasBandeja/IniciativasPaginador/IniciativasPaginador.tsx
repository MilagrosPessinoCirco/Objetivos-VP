import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing, typography } from '../../../../../../core/ui/foundations';
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

	const chevron = (backwards: boolean): React.ReactNode => (
		<FigmaIcon name="chevronRightPrimary" size="sm" className={backwards ? styles.backwards : undefined} />
	);

	const renderArrow = (label: string, target: number, disabled: boolean, backwards: boolean, double: boolean): React.ReactNode => (
		<Tooltip content={label}>
			<Button
				iconOnly
				variant="secondary"
				size="small"
				className={styles.arrow}
				disabled={disabled}
				aria-label={label}
				iconLeft={<span className={styles.icons}>{chevron(backwards)}{double && chevron(backwards)}</span>}
				onClick={() => onPageChange(target)}
			/>
		</Tooltip>
	);

	return (
		<nav className={inline ? `${styles.pager} ${styles.inline}` : styles.pager} style={{ gap: spacing.md }} aria-label={strings.IniciativasPagerAriaLabel}>
			<span className={styles.info} style={INFO_STYLE}>{info}</span>
			<div className={styles.buttons} style={{ gap: spacing.xs }}>
				{renderArrow(strings.IniciativasPageFirst, FIRST_PAGE, isFirst, true, true)}
				{renderArrow(strings.IniciativasPagePrevious, page - 1, isFirst, true, false)}
				{pages.map((number) => (
					<Button
						key={number}
						variant={number === page ? 'primary' : 'secondary'}
						size="small"
						className={styles.number}
						aria-current={number === page ? 'page' : undefined}
						aria-label={Utils.replaceAll(strings.IniciativasPageNumber, '{0}', String(number))}
						onClick={() => onPageChange(number)}
					>
						{String(number)}
					</Button>
				))}
				{renderArrow(strings.IniciativasPageNext, page + 1, isLast, false, false)}
				{renderArrow(strings.IniciativasPageLast, lastPage, isLast, false, true)}
			</div>
		</nav>
	);
};

export default IniciativasPaginador;
