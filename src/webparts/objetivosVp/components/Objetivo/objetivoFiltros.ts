import { Objetivo } from '../../../../core/entities';
import { Duracion } from '../../../../core/utils/Constants';

export interface IObjetivosFiltros {
	palancaId: string;
	departamentoId: string;
	gerenciaId: string;
	estado: string;
	anio: string;
}

export const EMPTY_OBJETIVOS_FILTROS: IObjetivosFiltros = { palancaId: '', departamentoId: '', gerenciaId: '', estado: '', anio: '' };

const matchesId = (id: number | undefined, selected: string): boolean => selected === '' || (id !== undefined && String(id) === selected);

const matchesAnio = (objetivo: Objetivo, anio: string): boolean => {
	if (anio === '') {
		return true;
	}
	if (!objetivo.FechaInicio) {
		return false;
	}
	const selected = Number(anio);
	const desde = objetivo.FechaInicio.getFullYear();
	if (objetivo.Duracion === Duracion.Permanente) {
		return selected >= desde;
	}
	return !!objetivo.FechaCompromiso && selected >= desde && selected <= objetivo.FechaCompromiso.getFullYear();
};

export const matchesObjetivoFiltros = (objetivo: Objetivo, filtros: IObjetivosFiltros): boolean =>
	matchesId(objetivo.Palanca?.Id, filtros.palancaId) &&
	matchesId(objetivo.Departamento?.Id, filtros.departamentoId) &&
	matchesId(objetivo.Gerencia?.Id, filtros.gerenciaId) &&
	(filtros.estado === '' || objetivo.Estado === filtros.estado) &&
	matchesAnio(objetivo, filtros.anio);

export const hasObjetivoFilter = (filtros: IObjetivosFiltros): boolean =>
	filtros.departamentoId !== '' || filtros.gerenciaId !== '' || filtros.estado !== '' || filtros.anio !== '';

export const getAniosObjetivos = (objetivos: Objetivo[]): number[] => {
	let min: number | undefined;
	let max: number | undefined;
	objetivos.forEach((objetivo) => {
		if (!objetivo.FechaInicio) {
			return;
		}
		const desde = objetivo.FechaInicio.getFullYear();
		const hasta = objetivo.Duracion !== Duracion.Permanente && objetivo.FechaCompromiso ? objetivo.FechaCompromiso.getFullYear() : desde;
		min = min === undefined ? desde : Math.min(min, desde);
		max = max === undefined ? Math.max(desde, hasta) : Math.max(max, desde, hasta);
	});
	const anios: number[] = [];
	if (min !== undefined && max !== undefined) {
		for (let anio = min; anio <= max; anio++) {
			anios.push(anio);
		}
	}
	return anios;
};
