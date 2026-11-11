const PALANCA_ID_PREFIX = 'PAL-';

export const formatPalancaId = (id: number | undefined): string =>
	id === undefined ? '' : `${PALANCA_ID_PREFIX}${id}`;
