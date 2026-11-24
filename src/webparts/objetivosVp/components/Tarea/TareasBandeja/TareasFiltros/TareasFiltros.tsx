import * as React from 'react';

import { Button, Dropdown } from '../../../../../../core/ui/components';
import { Panel } from '../../../../../../core/ui/patterns';
import { spacing } from '../../../../../../core/ui/foundations';
import { Departamento, Iniciativa, Objetivo } from '../../../../../../core/entities';
import { IPersonValue } from '../../../../../../core/utils/Mappers';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatIdNombre, formatIniciativaId, formatObjetivoLabel } from '../../../Iniciativa/iniciativaUtils';
import { ITareasFiltros } from '../../tareaUtils';
import styles from './TareasFiltros.module.scss';

export interface ITareasFiltrosProps {
	filtros: ITareasFiltros;
	departamentos: Departamento[];
	objetivos: Objetivo[];
	iniciativas: Iniciativa[];
	responsables: IPersonValue[];
	anios: number[];
	onApply: (filtros: ITareasFiltros) => void;
	onClear: () => void;
	onClose: () => void;
}

const SORT_LOCALE = 'es';

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

const withAll = (options: Array<{ key: string; text: string }>): Array<{ key: string; text: string }> =>
	[{ key: '', text: strings.IniciativasFilterAll }, ...options];

const byId = (a: { Id?: number }, b: { Id?: number }): number => (a.Id ?? 0) - (b.Id ?? 0);

const TareasFiltros: React.FC<ITareasFiltrosProps> = ({ filtros, departamentos, objetivos, iniciativas, responsables, anios, onApply, onClear, onClose }) => {
	const [borrador, setBorrador] = React.useState<ITareasFiltros>(filtros);

	const departamentoOptions = withAll(departamentos
		.slice()
		.sort((a, b) => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', SORT_LOCALE))
		.map((departamento) => ({ key: String(departamento.Id), text: departamento.Nombre ?? '' })));
	const objetivoOptions = withAll(objetivos
		.slice()
		.sort(byId)
		.map((objetivo) => ({ key: String(objetivo.Id), text: formatObjetivoLabel(objetivo) })));
	const iniciativaOptions = withAll(iniciativas
		.slice()
		.sort(byId)
		.map((iniciativa) => ({ key: String(iniciativa.Id), text: formatIdNombre(formatIniciativaId(iniciativa.Id), iniciativa.Nombre) })));
	const responsableOptions = withAll(responsables
		.slice()
		.sort((a, b) => a.Title.localeCompare(b.Title, SORT_LOCALE))
		.map((persona) => ({ key: String(persona.Id), text: persona.Title })));
	const anioOptions = withAll(anios.map((anio) => ({ key: String(anio), text: String(anio) })));

	const set = (key: keyof ITareasFiltros) => (value: string | string[]): void =>
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
				<Dropdown label={strings.IniciativaColumnName} options={iniciativaOptions} value={borrador.iniciativaId} onChange={set('iniciativaId')} />
				<Dropdown label={strings.TareaColumnResponsible} options={responsableOptions} value={borrador.responsableId} onChange={set('responsableId')} />
				<Dropdown label={strings.IniciativasFilterYear} options={anioOptions} value={borrador.anio} onChange={set('anio')} />
			</div>
		</Panel>
	);
};

export default TareasFiltros;
