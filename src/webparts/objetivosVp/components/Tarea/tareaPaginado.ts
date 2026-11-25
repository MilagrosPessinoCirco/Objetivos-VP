export const TAREAS_PAGE_SIZE = 10;
export const FIRST_PAGE = 1;

export interface ITareasPagina<T> {
	page: number;
	pageItems: T[];
	total: number;
}

export const paginarTareas = <T>(items: T[], page: number): ITareasPagina<T> => {
	const lastPage = Math.max(FIRST_PAGE, Math.ceil(items.length / TAREAS_PAGE_SIZE));
	const current = Math.min(Math.max(FIRST_PAGE, page), lastPage);
	return {
		page: current,
		pageItems: items.slice((current - 1) * TAREAS_PAGE_SIZE, current * TAREAS_PAGE_SIZE),
		total: items.length
	};
};
