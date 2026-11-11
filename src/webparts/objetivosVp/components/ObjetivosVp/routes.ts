export const HOME_PATH = '/';
export const PALANCAS_PATH = '/palanca';
export const PALANCA_DETAIL_PATH = `${PALANCAS_PATH}/:id`;
export const getPalancaPath = (id: number): string => `${PALANCAS_PATH}/${id}`;
