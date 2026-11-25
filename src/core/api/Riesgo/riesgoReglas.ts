import { Decision, Iniciativa, Riesgo, Tarea } from '../../entities';
import { EstadoIniciativa, EstadoRiesgo, EstadoTarea } from '../../utils/Constants';

export enum RiesgoRegla {
	DescripcionRequerida = 'DescripcionRequerida',
	DecisionRequerida = 'DecisionRequerida',
	FechaLimiteRequerida = 'FechaLimiteRequerida',
	FechaLimiteAnterior = 'FechaLimiteAnterior',
	TransicionNoPermitida = 'TransicionNoPermitida',
	RiesgoResuelto = 'RiesgoResuelto',
	TareaCancelada = 'TareaCancelada',
	TareaOIniciativaCerrada = 'TareaOIniciativaCerrada',
	RequiereDecisionFijo = 'RequiereDecisionFijo',
	EstadoNoLeido = 'EstadoNoLeido',
	CambioEnReintento = 'CambioEnReintento'
}

export interface IDecisionIssues {
	decision?: RiesgoRegla;
	fecha?: RiesgoRegla;
}

export const RIESGO_TITULO_MAX = 255;

const YEAR_FACTOR = 10000;
const MONTH_FACTOR = 100;

export const TRANSICIONES_RIESGO: Record<EstadoRiesgo, EstadoRiesgo[]> = {
	[EstadoRiesgo.Activo]: [EstadoRiesgo.Escalado, EstadoRiesgo.Resuelto],
	[EstadoRiesgo.Escalado]: [EstadoRiesgo.Resuelto],
	[EstadoRiesgo.Resuelto]: []
};

const ORDEN_ESTADOS: EstadoRiesgo[] = [EstadoRiesgo.Escalado, EstadoRiesgo.Activo, EstadoRiesgo.Resuelto];

const isVacio = (texto: string | undefined): boolean => texto === undefined || texto.trim() === '';

const toDia = (fecha: Date): number => fecha.getFullYear() * YEAR_FACTOR + (fecha.getMonth() + 1) * MONTH_FACTOR + fecha.getDate();

export const isMismoDia = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
	a !== null && a !== undefined && b !== null && b !== undefined && toDia(a) === toDia(b);

export const getEstadosDisponibles = (estado: EstadoRiesgo | undefined): EstadoRiesgo[] =>
	estado === undefined || TRANSICIONES_RIESGO[estado].length === 0 ? [] : [estado, ...TRANSICIONES_RIESGO[estado]];

export const isTransicionPermitida = (desde: EstadoRiesgo | undefined, hasta: EstadoRiesgo): boolean =>
	desde !== undefined && (desde === hasta || TRANSICIONES_RIESGO[desde].indexOf(hasta) !== -1);

export const isRiesgoEditable = (riesgo: Riesgo, tarea: Tarea): boolean =>
	riesgo.Estado !== undefined && riesgo.Estado !== EstadoRiesgo.Resuelto && tarea.Estado !== EstadoTarea.Cancelada;

export const canCargarRiesgo = (tarea: Tarea, iniciativa: Iniciativa): boolean =>
	tarea.Estado !== EstadoTarea.Finalizada && tarea.Estado !== EstadoTarea.Cancelada
	&& iniciativa.Estado !== EstadoIniciativa.Finalizada && iniciativa.Estado !== EstadoIniciativa.Cancelada;

export const isRequiereDecisionFijo = (decision: Decision | undefined): boolean => decision !== undefined;

export const getDescripcionIssue = (texto: string | undefined): RiesgoRegla | undefined =>
	isVacio(texto) ? RiesgoRegla.DescripcionRequerida : undefined;

export const getDecisionIssue = (
	requiere: boolean,
	texto: string | undefined,
	fecha: Date | null | undefined,
	fechaGuardada: Date | null | undefined,
	hoy: Date
): IDecisionIssues => {
	if (!requiere) {
		return {};
	}
	const issues: IDecisionIssues = {};
	if (isVacio(texto)) {
		issues.decision = RiesgoRegla.DecisionRequerida;
	}
	if (!fecha) {
		issues.fecha = RiesgoRegla.FechaLimiteRequerida;
	}
	else if (toDia(fecha) < toDia(hoy) && !(fechaGuardada && toDia(fecha) === toDia(fechaGuardada))) {
		issues.fecha = RiesgoRegla.FechaLimiteAnterior;
	}
	return issues;
};

export const isDecisionPendiente = (riesgo: Riesgo): boolean =>
	riesgo.RequiereDecision === true && riesgo.Estado !== EstadoRiesgo.Resuelto;

export const getIndicadoresRiesgos = (riesgos: Riesgo[]): { activos: number; escalados: number; decisionesPendientes: number } => ({
	activos: riesgos.filter((riesgo) => riesgo.Estado === EstadoRiesgo.Activo).length,
	escalados: riesgos.filter((riesgo) => riesgo.Estado === EstadoRiesgo.Escalado).length,
	decisionesPendientes: riesgos.filter(isDecisionPendiente).length
});

const getRangoEstado = (riesgo: Riesgo): number => {
	const rango = riesgo.Estado === undefined ? -1 : ORDEN_ESTADOS.indexOf(riesgo.Estado);
	return rango === -1 ? ORDEN_ESTADOS.length : rango;
};

export const compararRiesgos = (a: Riesgo, b: Riesgo): number =>
	getRangoEstado(a) - getRangoEstado(b) || (a.Id ?? 0) - (b.Id ?? 0);

export const ordenarRiesgos = (items: Riesgo[]): Riesgo[] => items.slice().sort(compararRiesgos);

export const recortarTitulo = (texto: string): string => texto.slice(0, RIESGO_TITULO_MAX);
