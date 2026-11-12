import type { ChipColor } from '../../../../core/ui/patterns';
import { Objetivo } from '../../../../core/entities';
import { Estado, VP_RRII_NOMBRE } from '../../../../core/utils/Constants';

const OBJETIVO_ID_PREFIX = 'OBJ-';
const ID_MIN_DIGITS = 2;
const NOT_FOUND_STATUS = 404;
const DATE_LOCALE = 'es-AR';
const DATE_PART_MIN_DIGITS = 2;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export type ObjetivosFiltro = 'todos' | 'delVp' | 'otrasVp';

export const formatObjetivoId = (id: number | undefined): string =>
	id === undefined ? '' : `${OBJETIVO_ID_PREFIX}${String(id).padStart(ID_MIN_DIGITS, '0')}`;

export const isVpRrii = (nombre: string | undefined): boolean => nombre === VP_RRII_NOMBRE;

export const filterObjetivos = (objetivos: Objetivo[], filtro: ObjetivosFiltro): Objetivo[] =>
	filtro === 'delVp' ? objetivos.filter((objetivo) => objetivo.EsDeVp === true) : objetivos;

export const getEstadoChipColor = (estado: Estado | undefined): ChipColor => {
	switch (estado) {
		case Estado.EnCurso:
			return 'brand';
		case Estado.FinalizadoCumplido:
			return 'success';
		case Estado.FinalizadoIncumplido:
			return 'danger';
		default:
			return 'neutral';
	}
};

export const isNotFoundError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'status' in error &&
	(error as { status: unknown }).status === NOT_FOUND_STATUS;

const twoDigits = (value: number): string => String(value).padStart(DATE_PART_MIN_DIGITS, '0');

export const toDateInput = (date: Date | null | undefined): string =>
	date ? `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}` : '';

export const fromDateInput = (value: string): Date | undefined => {
	const match = DATE_ONLY_PATTERN.exec(value);
	return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
};

export const formatDate = (date: Date | null | undefined): string =>
	date ? date.toLocaleDateString(DATE_LOCALE) : '';
