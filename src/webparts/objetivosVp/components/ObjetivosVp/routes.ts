export const HOME_PATH = '/';
export const PALANCAS_PATH = '/palanca';
export const PALANCA_DETAIL_PATH = `${PALANCAS_PATH}/:id`;
export const getPalancaPath = (id: number): string => `${PALANCAS_PATH}/${id}`;
export const OBJETIVO_PATH = '/objetivo';
export const OBJETIVO_DETAIL_PATH = `${OBJETIVO_PATH}/:id`;
export const getObjetivoPath = (id: number): string => `${OBJETIVO_PATH}/${id}`;
export const INICIATIVAS_PATH = '/iniciativa';
export const INICIATIVA_DETAIL_PATH = `${INICIATIVAS_PATH}/:id`;
export const INICIATIVAS_VISTA_PARAM = 'vista';
export const INICIATIVAS_VISTA_TODAS = 'todas';
export const getIniciativaPath = (id: number): string => `${INICIATIVAS_PATH}/${id}`;
export const TAREAS_PATH = '/tarea';
export const TAREA_DETAIL_PATH = `${TAREAS_PATH}/:id`;
export const TAREAS_VISTA_PARAM = 'vista';
export const TAREAS_VISTA_TODAS = 'todas';
export const getTareaPath = (id: number): string => `${TAREAS_PATH}/${id}`;

export const getFrom = (state: unknown): string | undefined => {
	const from = typeof state === 'object' && state !== null && 'from' in state ? (state as { from: unknown }).from : undefined;
	return typeof from === 'string' ? from : undefined;
};
