const LOOKUP_IDS_CHUNK_SIZE = 40;

export const buildLookupFilters = (lookupField: string, ids: number[]): string[] => {
	const filters: string[] = [];
	for (let start = 0; start < ids.length; start += LOOKUP_IDS_CHUNK_SIZE) {
		const clauses = ids.slice(start, start + LOOKUP_IDS_CHUNK_SIZE).map((id) => `${lookupField} eq ${id}`);
		filters.push(`(${clauses.join(' or ')})`);
	}
	return filters;
};
