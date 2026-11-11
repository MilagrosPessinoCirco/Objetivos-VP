export const HOME_PATH = '/';
export const PALANCAS_PATH = '/palanca';
export const PALANCA_DETAIL_PATH = `${PALANCAS_PATH}/:id`;
export const getPalancaPath = (id: number): string => `${PALANCAS_PATH}/${id}`;
export const OBJETIVO_PATH = '/objetivo';
export const OBJETIVO_NEW_PATH = `${OBJETIVO_PATH}/new`;
export const OBJETIVO_DETAIL_PATH = `${OBJETIVO_PATH}/:id`;
export const OBJETIVO_EDIT_PATH = `${OBJETIVO_PATH}/:id/edit`;
export const PALANCA_QUERY_PARAM = 'palanca';
export const getObjetivoPath = (id: number): string => `${OBJETIVO_PATH}/${id}`;
export const getObjetivoEditPath = (id: number): string => `${OBJETIVO_PATH}/${id}/edit`;
export const getObjetivoNewPath = (palancaId?: number): string =>
	palancaId === undefined ? OBJETIVO_NEW_PATH : `${OBJETIVO_NEW_PATH}?${PALANCA_QUERY_PARAM}=${palancaId}`;
