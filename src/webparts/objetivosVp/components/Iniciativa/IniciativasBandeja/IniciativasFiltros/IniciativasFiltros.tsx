import * as React from 'react';

import { Departamento, Objetivo } from '../../../../../../core/entities';
import { EstadoIniciativa } from '../../../../../../core/utils/Constants';
import { IPersonValue } from '../../../../../../core/utils/Mappers';
import * as strings from 'ObjetivosVpWebPartStrings';
import { IIniciativasFiltros, formatObjetivoLabel } from '../../iniciativaUtils';
import FiltrosPanel, { IFiltroField } from '../../../shared/FiltrosPanel/FiltrosPanel';

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

const withAll = (options: Array<{ key: string; text: string }>): Array<{ key: string; text: string }> =>
	[{ key: '', text: strings.IniciativasFilterAll }, ...options];

const IniciativasFiltros: React.FC<IIniciativasFiltrosProps> = ({ filtros, departamentos, objetivos, accountables, anios, onApply, onClear, onClose }) => {
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

	const fields = (): Array<IFiltroField<IIniciativasFiltros>> => [
		{ key: 'departamentoId', label: strings.ObjetivoFieldDepartment, options: departamentoOptions },
		{ key: 'objetivoId', label: strings.ObjetivoColumnName, options: objetivoOptions },
		{ key: 'accountableId', label: strings.IniciativaAccountable, options: accountableOptions },
		{ key: 'estado', label: strings.ObjetivoFormStatus, options: estadoOptions },
		{ key: 'anio', label: strings.IniciativasFilterYear, options: anioOptions }
	];

	return <FiltrosPanel filtros={filtros} fields={fields} onApply={onApply} onClear={onClear} onClose={onClose} />;
};

export default IniciativasFiltros;
