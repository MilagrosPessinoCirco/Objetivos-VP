import type { ChipColor } from '../../../../core/ui/patterns';
import { Iniciativa, Objetivo, Tarea } from '../../../../core/entities';
import { EstadoIniciativa, EstadoTarea } from '../../../../core/utils/Constants';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate, toDateInput } from '../Objetivo/objetivoUtils';

const TAREA_ID_PREFIX = 'TAR-';
const ID_MIN_DIGITS = 2;
const AVANCE_MIN = 0;
const AVANCE_MAX = 100;

export const TAREA_MAX_LENGTH = { nombre: 100, comentario: 500 };

export const TAREAS_MAX_NO_CANCELADAS = 10;

export type TareasVista = 'mis' | 'todas';

export interface ITareasFiltros {
	departamentoId: string;
	objetivoId: string;
	iniciativaId: string;
	responsableId: string;
	anio: string;
}

export const EMPTY_TAREAS_FILTROS: ITareasFiltros = { departamentoId: '', objetivoId: '', iniciativaId: '', responsableId: '', anio: '' };

export interface ITareaFechasIssues {
	inicio?: string;
	compromiso?: string;
}

export const TRANSICIONES_TAREA: Record<EstadoTarea, EstadoTarea[]> = {
	[EstadoTarea.NoIniciada]: [EstadoTarea.EnCurso, EstadoTarea.Cancelada],
	[EstadoTarea.EnCurso]: [EstadoTarea.Frenada, EstadoTarea.Finalizada, EstadoTarea.Cancelada],
	[EstadoTarea.Frenada]: [EstadoTarea.EnCurso, EstadoTarea.Cancelada],
	[EstadoTarea.Finalizada]: [EstadoTarea.EnCurso],
	[EstadoTarea.Cancelada]: []
};

export const formatTareaId = (id: number | undefined): string =>
	id === undefined ? '' : `${TAREA_ID_PREFIX}${String(id).padStart(ID_MIN_DIGITS, '0')}`;

export const getEstadoTareaChipColor = (estado: EstadoTarea | undefined): ChipColor => {
	switch (estado) {
		case EstadoTarea.EnCurso:
			return 'brand';
		case EstadoTarea.Frenada:
			return 'danger';
		case EstadoTarea.Finalizada:
			return 'success';
		case EstadoTarea.Cancelada:
			return 'secondary';
		default:
			return 'neutral';
	}
};

export const getAniosObjetivo = (objetivo: Objetivo | undefined): number[] => {
	if (!objetivo?.FechaInicio || !objetivo.FechaCompromiso) {
		return [];
	}
	const anios: number[] = [];
	for (let anio = objetivo.FechaInicio.getFullYear(); anio <= objetivo.FechaCompromiso.getFullYear(); anio++) {
		anios.push(anio);
	}
	return anios;
};

export const getEstadosDisponibles = (estado: EstadoTarea | undefined): EstadoTarea[] => {
	const actual = estado ?? EstadoTarea.NoIniciada;
	return actual === EstadoTarea.Finalizada || actual === EstadoTarea.Cancelada
		? TRANSICIONES_TAREA[actual]
		: [actual, ...TRANSICIONES_TAREA[actual]];
};

export const canEditTarea = (tarea: Tarea): boolean => tarea.Estado !== EstadoTarea.Cancelada;

export const canRegistrarAvance = (tarea: Tarea): boolean => tarea.Estado !== EstadoTarea.Cancelada;

export const isReapertura = (desde: EstadoTarea | undefined, hacia: EstadoTarea): boolean =>
	desde === EstadoTarea.Finalizada && hacia === EstadoTarea.EnCurso;

export const requiereConfirmacion = (desde: EstadoTarea | undefined, hacia: EstadoTarea): boolean =>
	desde !== hacia && (hacia === EstadoTarea.Finalizada || hacia === EstadoTarea.Cancelada);

export const getAvanceIssue = (texto: string): string | undefined => {
	const recortado = texto.trim();
	const valor = Number(recortado);
	return recortado === '' || !Number.isInteger(valor) || valor < AVANCE_MIN || valor > AVANCE_MAX
		? strings.TareaProgressInvalid
		: undefined;
};

export const getFechaFinalizacionIssue = (fecha: string, fechaInicio: string, hoy: string): string | undefined => {
	if (fecha === '') {
		return strings.RequiredField;
	}
	if (fechaInicio !== '' && fecha < fechaInicio) {
		return strings.TareaFinishDateBeforeStart;
	}
	return fecha > hoy ? strings.TareaFinishDateFuture : undefined;
};

export const getFechasIssues = (fechaInicio: string, fechaCompromiso: string, iniciativa: Iniciativa | undefined): ITareaFechasIssues => {
	const rangoInicio = toDateInput(iniciativa?.FechaInicio);
	const rangoCompromiso = toDateInput(iniciativa?.FechaCompromiso);
	const hasRange = rangoInicio !== '' && rangoCompromiso !== '';
	const outOfRange = Utils.replaceAll(Utils.replaceAll(strings.TareaDateOutOfRange,
		'{0}', formatDate(iniciativa?.FechaInicio)),
		'{1}', formatDate(iniciativa?.FechaCompromiso));
	return {
		inicio: fechaInicio === ''
			? strings.RequiredField
			: hasRange && fechaInicio < rangoInicio ? outOfRange : undefined,
		compromiso: fechaCompromiso === ''
			? strings.RequiredField
			: fechaInicio !== '' && fechaCompromiso < fechaInicio
				? strings.ObjetivoDateOrder
				: hasRange && fechaCompromiso > rangoCompromiso ? outOfRange : undefined
	};
};

export const getLengthIssue = (valor: string, max: number, mensaje: string): string | undefined =>
	valor.length > max ? Utils.replaceAll(mensaje, '{0}', String(max)) : undefined;

export const countNoCanceladas = (tareas: Tarea[]): number =>
	tareas.filter((tarea) => tarea.Estado !== EstadoTarea.Cancelada).length;

export const getTopeIssue = (tareas: Tarea[]): string | undefined =>
	countNoCanceladas(tareas) >= TAREAS_MAX_NO_CANCELADAS
		? Utils.replaceAll(strings.TareaLimitReached, '{0}', String(TAREAS_MAX_NO_CANCELADAS))
		: undefined;

export const canCargarTarea = (iniciativa: Iniciativa, tareas: Tarea[]): boolean =>
	iniciativa.Estado !== EstadoIniciativa.Finalizada &&
	iniciativa.Estado !== EstadoIniciativa.Cancelada &&
	countNoCanceladas(tareas) < TAREAS_MAX_NO_CANCELADAS;

const TOPE_ERROR_NAME = 'TareaTopeError';

export const createTopeError = (mensaje: string): Error => {
	const error = new Error(mensaje);
	error.name = TOPE_ERROR_NAME;
	return error;
};

export const isTopeError = (error: unknown): error is Error => error instanceof Error && error.name === TOPE_ERROR_NAME;

export const matchesTareaSearch = (tarea: Tarea, search: string): boolean =>
	formatTareaId(tarea.Id).toLowerCase().indexOf(search) >= 0 ||
	(tarea.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

export const matchesTareasFiltros = (tarea: Tarea, filtros: ITareasFiltros, iniciativas: Iniciativa[], objetivos: Objetivo[]): boolean => {
	const iniciativa = iniciativas.filter((item) => item.Id === tarea.Iniciativa?.Id)[0];
	const objetivo = objetivos.filter((item) => item.Id === iniciativa?.Objetivo?.Id)[0];
	return (filtros.departamentoId === '' || String(objetivo?.Departamento?.Id) === filtros.departamentoId) &&
		(filtros.objetivoId === '' || String(iniciativa?.Objetivo?.Id) === filtros.objetivoId) &&
		(filtros.iniciativaId === '' || String(tarea.Iniciativa?.Id) === filtros.iniciativaId) &&
		(filtros.responsableId === '' || String(tarea.Responsable?.Id) === filtros.responsableId) &&
		(filtros.anio === '' || getAniosObjetivo(objetivo).indexOf(Number(filtros.anio)) >= 0);
};
