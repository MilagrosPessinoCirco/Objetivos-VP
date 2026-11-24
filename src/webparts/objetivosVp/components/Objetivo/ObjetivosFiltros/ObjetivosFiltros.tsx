import * as React from 'react';

import { Departamento, Gerencia, Palanca } from '../../../../../core/entities';
import { Estado } from '../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import FiltrosPanel, { IFiltroField, IFiltroOption } from '../../shared/FiltrosPanel/FiltrosPanel';
import { IObjetivosFiltros } from '../objetivoFiltros';

export interface IObjetivosFiltrosProps {
	filtros: IObjetivosFiltros;
	palancas: Palanca[];
	departamentos: Departamento[];
	gerencias: Gerencia[];
	anios: number[];
	onApply: (filtros: IObjetivosFiltros) => void;
	onClear: () => void;
	onClose: () => void;
}

const SORT_LOCALE = 'es';

const byNombre = (a: { Nombre?: string }, b: { Nombre?: string }): number => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', SORT_LOCALE);

const withAll = (allText: string, options: IFiltroOption[]): IFiltroOption[] => [{ key: '', text: allText }, ...options];

const toOption = (item: { Id?: number; Nombre?: string }): IFiltroOption => ({ key: String(item.Id), text: item.Nombre ?? '' });

const ObjetivosFiltros: React.FC<IObjetivosFiltrosProps> = ({ filtros, palancas, departamentos, gerencias, anios, onApply, onClear, onClose }) => {
	const fields = (borrador: IObjetivosFiltros): Array<IFiltroField<IObjetivosFiltros>> => [
		{ key: 'palancaId', label: strings.PalancaColumnName, options: withAll(strings.FiltersAllFeminine, palancas.slice().sort(byNombre).map(toOption)) },
		{ key: 'departamentoId', label: strings.ObjetivoFieldDepartment, options: withAll(strings.FiltersAllFeminine, departamentos.slice().sort(byNombre).map(toOption)) },
		{
			key: 'gerenciaId',
			label: strings.ObjetivoFieldManagement,
			options: withAll(strings.FiltersAllFeminine, gerencias
				.filter((gerencia) => borrador.departamentoId === '' || String(gerencia.Departamento?.Id) === borrador.departamentoId)
				.sort(byNombre)
				.map(toOption))
		},
		{ key: 'estado', label: strings.ObjetivoFormStatus, options: withAll(strings.IniciativasFilterAll, Object.values(Estado).map((value) => ({ key: value, text: value }))) },
		{ key: 'anio', label: strings.IniciativasFilterYear, options: withAll(strings.IniciativasFilterAll, anios.map((anio) => ({ key: String(anio), text: String(anio) }))) }
	];

	const normalize = (borrador: IObjetivosFiltros, changedKey: keyof IObjetivosFiltros): IObjetivosFiltros => {
		if (changedKey !== 'departamentoId' || borrador.gerenciaId === '') {
			return borrador;
		}
		const gerencia = gerencias.filter((item) => String(item.Id) === borrador.gerenciaId)[0];
		return borrador.departamentoId !== '' && String(gerencia?.Departamento?.Id) !== borrador.departamentoId ? { ...borrador, gerenciaId: '' } : borrador;
	};

	return <FiltrosPanel filtros={filtros} fields={fields} normalize={normalize} onApply={onApply} onClear={onClear} onClose={onClose} />;
};

export default ObjetivosFiltros;
