import type { CSSProperties } from 'react';
import type { ChipColor } from '../../../../core/ui/patterns';
import { Iniciativa, ResultadoClave } from '../../../../core/entities';
import { EstadoIniciativa } from '../../../../core/utils/Constants';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../shared/getColorStep';

const AVANCE_UMBRAL_AMARILLO = 60;
const AVANCE_UMBRAL_VERDE = 80;
const FULL_PERCENT = 100;
const NORMALIZE_FACTOR = 1000000;
const NUMBER_LOCALE = 'es-AR';
const NUMBER_MAX_DECIMALS = 4;
const RESULTADO_CLAVE_ID_PREFIX = 'KR-';
const ID_MIN_DIGITS = 2;

export const RESULTADO_CLAVE_MAX_LENGTH = { nombre: 100, unidad: 20, fuente: 100, evidencia: 255, comentario: 500 };

export enum EstadoResultadoClave { SinDato, NoCumple, Minimo, Meta, Maximo }

export type AvanceColor = 'rojo' | 'amarillo' | 'verde';

export interface IEstadoResultadoClaveChip {
	color: ChipColor;
	style?: CSSProperties;
}

export interface IResultadoClaveDraft {
	key: number;
	id?: number;
	nombre: string;
	tipo: string;
	unidad: string;
	minimo: string;
	meta: string;
	maximo: string;
}

export interface IResultadoClaveIssues {
	nombre?: string;
	tipo?: string;
	unidad?: string;
	minimo?: string;
	meta?: string;
	maximo?: string;
}

const normalizeAvance = (valor: number): number => Math.round(valor * NORMALIZE_FACTOR) / NORMALIZE_FACTOR;

export const hasValorActual = (resultado: ResultadoClave): boolean =>
	resultado.ValorActual !== undefined && resultado.ValorActual !== null;

export const getCumplimiento = (resultado: ResultadoClave): number => {
	const maximo = resultado.Maximo;
	if (!hasValorActual(resultado) || maximo === undefined || !(maximo > 0)) {
		return 0;
	}
	return normalizeAvance((resultado.ValorActual as number) * FULL_PERCENT / maximo);
};

export const getEstadoResultadoClave = (resultado: ResultadoClave): EstadoResultadoClave => {
	if (!hasValorActual(resultado)) {
		return EstadoResultadoClave.SinDato;
	}
	const valor = resultado.ValorActual as number;
	if (resultado.Minimo !== undefined && valor < resultado.Minimo) {
		return EstadoResultadoClave.NoCumple;
	}
	if (resultado.Meta !== undefined && valor < resultado.Meta) {
		return EstadoResultadoClave.Minimo;
	}
	if (resultado.Maximo !== undefined && valor < resultado.Maximo) {
		return EstadoResultadoClave.Meta;
	}
	return EstadoResultadoClave.Maximo;
};

export const getEstadoResultadoClaveLabel = (estado: EstadoResultadoClave): string => {
	switch (estado) {
		case EstadoResultadoClave.NoCumple:
			return strings.ResultadoClaveStatusNotMet;
		case EstadoResultadoClave.Minimo:
			return strings.ResultadoClaveStatusMinimum;
		case EstadoResultadoClave.Meta:
			return strings.ResultadoClaveStatusGoal;
		case EstadoResultadoClave.Maximo:
			return strings.ResultadoClaveStatusMaximum;
		default:
			return strings.ResultadoClaveStatusNoData;
	}
};

export const getEstadoResultadoClaveChip = (estado: EstadoResultadoClave): IEstadoResultadoClaveChip => {
	switch (estado) {
		case EstadoResultadoClave.NoCumple:
			return { color: 'danger' };
		case EstadoResultadoClave.Minimo:
			return { color: 'warning' };
		case EstadoResultadoClave.Meta:
			return {
				color: 'warning',
				style: { backgroundColor: getColorStep('Yellow', '100').value, color: getColorStep('Yellow', '800').value }
			};
		case EstadoResultadoClave.Maximo:
			return { color: 'success' };
		default:
			return { color: 'neutral' };
	}
};

export const getPesoResultadoClave = (cantidad: number): number => FULL_PERCENT / cantidad;

const getAporte = (resultado: ResultadoClave): number => Math.max(0, Math.min(getCumplimiento(resultado), FULL_PERCENT));

export const getAvanceIniciativa = (resultados: ResultadoClave[]): number => {
	if (resultados.length === 0) {
		return 0;
	}
	const suma = resultados.reduce((total, resultado) => total + getAporte(resultado), 0);
	return normalizeAvance(suma / resultados.length);
};

export const getAvanceObjetivo = (objetivoId: number | undefined, iniciativas: Iniciativa[], resultados: ResultadoClave[]): number => {
	const vigentes = iniciativas.filter((iniciativa) => iniciativa.Objetivo?.Id === objetivoId && iniciativa.Estado !== EstadoIniciativa.Cancelada);
	if (vigentes.length === 0) {
		return 0;
	}
	const suma = vigentes.reduce(
		(total, iniciativa) => total + getAvanceIniciativa(resultados.filter((resultado) => resultado.Iniciativa?.Id === iniciativa.Id)),
		0
	);
	return normalizeAvance(suma / vigentes.length);
};

export const getAvanceColor = (avance: number): AvanceColor => {
	const valor = normalizeAvance(avance);
	if (valor < AVANCE_UMBRAL_AMARILLO) {
		return 'rojo';
	}
	return valor < AVANCE_UMBRAL_VERDE ? 'amarillo' : 'verde';
};

export const formatAvance = (avance: number): number => {
	const redondeado = Math.round(avance);
	return redondeado === 0 ? 0 : redondeado;
};

export const formatResultadoClaveId = (id: number | undefined): string =>
	id === undefined ? '' : `${RESULTADO_CLAVE_ID_PREFIX}${String(id).padStart(ID_MIN_DIGITS, '0')}`;

export const formatResultadoClaveNumero = (valor: number | null | undefined): string =>
	valor === undefined || valor === null
		? strings.ObjetivoNoValue
		: valor.toLocaleString(NUMBER_LOCALE, { maximumFractionDigits: NUMBER_MAX_DECIMALS });

export const getLengthIssue = (valor: string, max: number): string | undefined =>
	valor.trim().length > max ? Utils.replaceAll(strings.ResultadoClaveTooLong, '{0}', String(max)) : undefined;

export const parseNumero = (texto: string): number | undefined => {
	if (texto.trim() === '') {
		return undefined;
	}
	const valor = Number(texto);
	return isFinite(valor) ? valor : undefined;
};

const numeroToText = (valor: number | undefined): string => (valor === undefined ? '' : String(valor));

export const createEmptyDraft = (key: number): IResultadoClaveDraft =>
	({ key, nombre: '', tipo: '', unidad: '', minimo: '', meta: '', maximo: '' });

export const toDraft = (resultado: ResultadoClave, key: number): IResultadoClaveDraft => ({
	key,
	id: resultado.Id,
	nombre: resultado.Nombre ?? '',
	tipo: resultado.TipoMedicion ?? '',
	unidad: resultado.UnidadMedida ?? '',
	minimo: numeroToText(resultado.Minimo),
	meta: numeroToText(resultado.Meta),
	maximo: numeroToText(resultado.Maximo)
});

const getTextoIssue = (valor: string, max: number): string | undefined =>
	valor.trim() === '' ? strings.RequiredField : getLengthIssue(valor, max);

const getNumeroIssue = (texto: string): string | undefined => {
	if (texto.trim() === '') {
		return strings.RequiredField;
	}
	return parseNumero(texto) === undefined ? strings.ResultadoClaveNotNumber : undefined;
};

export const getDraftIssues = (draft: IResultadoClaveDraft): IResultadoClaveIssues => {
	const issues: IResultadoClaveIssues = {};
	const nombre = getTextoIssue(draft.nombre, RESULTADO_CLAVE_MAX_LENGTH.nombre);
	const unidad = getTextoIssue(draft.unidad, RESULTADO_CLAVE_MAX_LENGTH.unidad);
	const minimoNumero = getNumeroIssue(draft.minimo);
	const metaNumero = getNumeroIssue(draft.meta);
	const maximoNumero = getNumeroIssue(draft.maximo);
	const minimo = parseNumero(draft.minimo);
	const meta = parseNumero(draft.meta);
	const maximo = parseNumero(draft.maximo);

	if (nombre) {
		issues.nombre = nombre;
	}
	if (draft.tipo.trim() === '') {
		issues.tipo = strings.RequiredField;
	}
	if (unidad) {
		issues.unidad = unidad;
	}
	if (minimoNumero) {
		issues.minimo = minimoNumero;
	}
	if (metaNumero) {
		issues.meta = metaNumero;
	}
	else if (minimo !== undefined && meta !== undefined && meta < minimo) {
		issues.meta = strings.ResultadoClaveGoalBelowMin;
	}
	if (maximoNumero) {
		issues.maximo = maximoNumero;
	}
	else if (maximo !== undefined && maximo <= 0) {
		issues.maximo = strings.ResultadoClaveMaxPositive;
	}
	else if (maximo !== undefined && meta !== undefined && maximo < meta) {
		issues.maximo = strings.ResultadoClaveMaxBelowGoal;
	}
	return issues;
};

export const hasDraftIssues = (issues: IResultadoClaveIssues): boolean => Object.keys(issues).length > 0;

export const isDraftChanged = (draft: IResultadoClaveDraft, original: ResultadoClave): boolean =>
	draft.nombre.trim() !== (original.Nombre ?? '') ||
	draft.unidad.trim() !== (original.UnidadMedida ?? '') ||
	draft.tipo !== (original.TipoMedicion ?? '') ||
	Number(draft.minimo) !== original.Minimo ||
	Number(draft.meta) !== original.Meta ||
	Number(draft.maximo) !== original.Maximo;
