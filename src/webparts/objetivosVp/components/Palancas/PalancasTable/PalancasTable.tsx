import * as React from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import { Palanca } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatPalancaId } from '../formatPalancaId';
import styles from './PalancasTable.module.scss';

export interface IPalancasTableProps {
	palancas: Palanca[];
	emptyText: string;
	canManage: boolean;
	onView: (id: number) => void;
	onEdit?: (palanca: Palanca) => void;
}

type PalancaRow = {
	id: string;
	nombre: string;
	descripcion: string;
	palanca: Palanca;
};

const PalancasTable: React.FC<IPalancasTableProps> = ({ palancas, emptyText, canManage, onView, onEdit }) => {
	const rows: PalancaRow[] = palancas.map((palanca) => ({
		id: formatPalancaId(palanca.Id),
		nombre: palanca.Nombre ?? '',
		descripcion: palanca.Descripcion ?? '',
		palanca
	}));

	const renderActions = (row: PalancaRow): React.ReactNode => (
		<div className={styles.actions} style={{ gap: spacing.xs }}>
			{canManage && onEdit && (
				<Tooltip content={strings.PalancaEditTooltip}>
					<Button
						iconOnly
						variant="secondary"
						size="small"
						iconLeft={<FigmaIcon name="edit" />}
						aria-label={Utils.replaceAll(strings.PalancaEditAriaLabel, '{0}', row.id)}
						onClick={() => onEdit(row.palanca)}
					/>
				</Tooltip>
			)}
			<Tooltip content={strings.PalancaViewTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					iconLeft={<FigmaIcon name="arrowForward" />}
					aria-label={Utils.replaceAll(strings.PalancaViewAriaLabel, '{0}', row.id)}
					onClick={() => onView(row.palanca.Id as number)}
				/>
			</Tooltip>
		</div>
	);

	const columns: ITableColumn<PalancaRow>[] = [
		{ key: 'id', header: strings.PalancaColumnId },
		{ key: 'nombre', header: strings.PalancaColumnName },
		{ key: 'descripcion', header: strings.PalancaColumnDescription, render: (value) => <span className={styles.description}>{String(value)}</span> },
		{ key: 'acciones', header: strings.PalancaColumnActions, render: (_value, row) => renderActions(row) }
	];

	return <Table<PalancaRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default PalancasTable;
