import type { ChipColor } from '../../../../core/ui/patterns';
import { ComentarioIniciativa, Iniciativa, Objetivo } from '../../../../core/entities';
import { EstadoIniciativa } from '../../../../core/utils/Constants';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatObjetivoId, isVpRrii } from '../Objetivo/objetivoUtils';

const INICIATIVA_ID_PREFIX = 'INI-';
const ID_MIN_DIGITS = 2;
const FULL_WEIGHT = 100;
const WEIGHT_LOCALE = 'es-AR';
const WEIGHT_MAX_DECIMALS = 2;

export type IniciativasVista = 'mis' | 'todas';

export interface IIniciativasFiltros {
	departamentoId: string;
	objetivoId: string;
	accountableId: string;
	estado: string;
	anio: string;
}

export const EMPTY_FILTROS: IIniciativasFiltros = { departamentoId: '', objetivoId: '', accountableId: '', estado: '', anio: '' };

export interface IIniciativaPesos {
	enObjetivo?: number;
	enDepartamento?: number | null;
}

export const formatIniciativaId = (id: number | undefined): string =>
	id === undefined ? '' : `${INICIATIVA_ID_PREFIX}${String(id).padStart(ID_MIN_DIGITS, '0')}`;

export const formatIdNombre = (id: string, nombre: string | undefined): string =>
	Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDetailTitle, '{0}', id), '{1}', nombre ?? '');

export const formatObjetivoLabel = (objetivo: Objetivo): string => formatIdNombre(formatObjetivoId(objetivo.Id), objetivo.Nombre);

export const getEstadoIniciativaChipColor = (estado: EstadoIniciativa | undefined): ChipColor => {
	switch (estado) {
		case EstadoIniciativa.EnCurso:
			return 'brand';
		case EstadoIniciativa.Frenada:
			return 'danger';
		case EstadoIniciativa.Finalizada:
			return 'success';
		case EstadoIniciativa.Cancelada:
			return 'secondary';
		default:
			return 'neutral';
	}
};

const isCancelada = (iniciativa: Iniciativa): boolean => iniciativa.Estado === EstadoIniciativa.Cancelada;

export const getPesosIniciativa = (iniciativa: Iniciativa, delObjetivo: Iniciativa[], objetivo: Objetivo | undefined): IIniciativaPesos => {
	if (!objetivo || !isVpRrii(objetivo.VP?.Title) || isCancelada(iniciativa)) {
		return {};
	}
	const noCanceladas = delObjetivo.filter((item) => !isCancelada(item)).length;
	if (noCanceladas === 0) {
		return {};
	}
	const pesoDepartamento = objetivo.Peso;
	return {
		enObjetivo: FULL_WEIGHT / noCanceladas,
		enDepartamento: pesoDepartamento === undefined || pesoDepartamento === null ? null : pesoDepartamento / noCanceladas
	};
};

export const formatPeso = (valor: number): string =>
	valor.toLocaleString(WEIGHT_LOCALE, { maximumFractionDigits: WEIGHT_MAX_DECIMALS });

export const formatAccountable = (iniciativa: Iniciativa): string =>
	iniciativa.Accountable?.Title ?? '';

export const isAccountable = (iniciativa: Iniciativa, userId: number | undefined): boolean =>
	userId !== undefined && iniciativa.Accountable?.Id === userId;

export const getAniosIniciativa = (iniciativa: Iniciativa): number[] => {
	if (!iniciativa.FechaInicio || !iniciativa.FechaCompromiso) {
		return [];
	}
	const anios: number[] = [];
	for (let anio = iniciativa.FechaInicio.getFullYear(); anio <= iniciativa.FechaCompromiso.getFullYear(); anio++) {
		anios.push(anio);
	}
	return anios;
};

const isNewer = (a: ComentarioIniciativa, b: ComentarioIniciativa): boolean => {
	const timeA = a.Created?.getTime() ?? 0;
	const timeB = b.Created?.getTime() ?? 0;
	return timeA > timeB || (timeA === timeB && (a.Id ?? 0) > (b.Id ?? 0));
};

export const getUltimoComentario = (comentarios: ComentarioIniciativa[], iniciativaId: number): ComentarioIniciativa | undefined =>
	comentarios
		.filter((comentario) => comentario.Iniciativa?.Id === iniciativaId)
		.reduce<ComentarioIniciativa | undefined>((ultimo, comentario) => (!ultimo || isNewer(comentario, ultimo) ? comentario : ultimo), undefined);
