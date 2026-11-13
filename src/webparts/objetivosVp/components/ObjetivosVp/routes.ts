export const HOME_PATH = '/';
export const PALANCAS_PATH = '/palanca';
export const PALANCA_DETAIL_PATH = `${PALANCAS_PATH}/:id`;
export const getPalancaPath = (id: number): string => `${PALANCAS_PATH}/${id}`;
export const OBJETIVO_PATH = '/objetivo';
export const OBJETIVO_DETAIL_PATH = `${OBJETIVO_PATH}/:id`;
export const getObjetivoPath = (id: number): string => `${OBJETIVO_PATH}/${id}`;
