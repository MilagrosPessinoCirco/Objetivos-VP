import * as React from 'react';

import { Button, Dropdown } from '../../../../../../core/ui/components';
import { Panel } from '../../../../../../core/ui/patterns';
import { spacing } from '../../../../../../core/ui/foundations';
import { Departamento, Objetivo } from '../../../../../../core/entities';
import { EstadoIniciativa } from '../../../../../../core/utils/Constants';
import { IPersonValue } from '../../../../../../core/utils/Mappers';
import * as strings from 'ObjetivosVpWebPartStrings';
import { IIniciativasFiltros, formatObjetivoLabel } from '../../iniciativaUtils';
import styles from './IniciativasFiltros.module.scss';

export interface IIniciativasFiltrosProps {
	filtros: IIniciativasFiltros;
	departamentos: Departamento[];
	objetivos: Objetivo[];
	accountables: IPersonValue[];
	anios: number[];
	onApply: (filtros: IIniciativasFiltros) => void;
	onClear: () => void;
	onClose: () => void;
}

const SORT_LOCALE = 'es';

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const withAll = (options: Array<{ key: string; text: string }>): Array<{ key: string; text: string }> =>
	[{ key: '', text: strings.IniciativasFilterAll }, ...options];

const IniciativasFiltros: React.FC<IIniciativasFiltrosProps> = ({ filtros, departamentos, objetivos, accountables, anios, onApply, onClear, onClose }) => {
	const [borrador, setBorrador] = React.useState<IIniciativasFiltros>(filtros);

	const departamentoOptions = withAll(departamentos
		.slice()
		.sort((a, b) => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', SORT_LOCALE))
		.map((departamento) => ({ key: String(departamento.Id), text: departamento.Nombre ?? '' })));
	const objetivoOptions = withAll(objetivos
		.slice()
		.sort((a, b) => (a.Id ?? 0) - (b.Id ?? 0))
		.map((objetivo) => ({ key: String(objetivo.Id), text: formatObjetivoLabel(objetivo) })));
	const accountableOptions = withAll(accountables
		.slice()
		.sort((a, b) => a.Title.localeCompare(b.Title, SORT_LOCALE))
		.map((persona) => ({ key: String(persona.Id), text: persona.Title })));
	const estadoOptions = withAll(Object.values(EstadoIniciativa).map((value) => ({ key: value, text: value })));
	const anioOptions = withAll(anios.map((anio) => ({ key: String(anio), text: String(anio) })));

	const set = (key: keyof IIniciativasFiltros) => (value: string | string[]): void =>
		setBorrador({ ...borrador, [key]: toKey(value) });

	return (
		<Panel
			open
			className={styles.panel}
			title={strings.PalancasFilters}
			onClose={onClose}
			primaryAction={<Button variant="secondary" onClick={onClear}>{strings.IniciativasFiltersClear}</Button>}
			secondaryAction={<Button variant="primary" onClick={() => onApply(borrador)}>{strings.IniciativasFiltersApply}</Button>}
		>
			<div className={styles.fields} style={{ gap: spacing.lg }}>
				<Dropdown label={strings.ObjetivoFieldDepartment} options={departamentoOptions} value={borrador.departamentoId} onChange={set('departamentoId')} />
				<Dropdown label={strings.ObjetivoColumnName} options={objetivoOptions} value={borrador.objetivoId} onChange={set('objetivoId')} />
				<Dropdown label={strings.IniciativaAccountable} options={accountableOptions} value={borrador.accountableId} onChange={set('accountableId')} />
				<Dropdown label={strings.ObjetivoFormStatus} options={estadoOptions} value={borrador.estado} onChange={set('estado')} />
				<Dropdown label={strings.IniciativasFilterYear} options={anioOptions} value={borrador.anio} onChange={set('anio')} />
			</div>
		</Panel>
	);
};

export default IniciativasFiltros;
