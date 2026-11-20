import { Area } from '../../entities';
import { Lista } from '../../utils/Constants';
import IAreaDataSource from './IAreaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el área solicitada en el mock.';

const createArea = (id: number, nombre: string, gerenciaId: number, gerencia: string): Area =>
	new Area({ Id: id, Title: nombre, Nombre: nombre, Gerencia: { Id: gerenciaId, Title: gerencia } });

let areas: Area[] = [
	createArea(1, 'Análisis de mercado', 1, 'B2B'),
	createArea(2, 'Canal digital', 2, 'B2C'),
	createArea(3, 'Promociones', 3, 'Growth'),
	createArea(4, 'Gestión de convenios', 4, 'Convenios')
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class AreaMock implements IAreaDataSource {
	public listTitle: string = Lista.Area;

	public getItems(): Promise<Area[]> {
		return Promise.resolve(areas.slice());
	}

	public add(item: Area): Promise<Area> {
		const nextId = areas.reduce((maxId, area) => Math.max(maxId, area.Id ?? 0), 0) + 1;
		const created = Object.assign(new Area(), item, { Id: nextId });
		areas = areas.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Area): Promise<Area> {
		if (!areas.some((area) => area.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Area(), item);
		areas = areas.map((area) => (area.Id === edited.Id ? edited : area));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		areas = areas.filter((area) => area.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Area> {
		const area = areas.filter((item) => item.Id === itemId)[0];
		return area ? Promise.resolve(area) : Promise.reject(notFoundError());
	}
}
