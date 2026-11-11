import { Gerencia } from '../../entities';
import { Lista } from '../../utils/Constants';
import IGerenciaDataSource from './IGerenciaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la gerencia solicitada en el mock.';

const createGerencia = (id: number, nombre: string, departamentoId: number, departamento: string): Gerencia =>
	new Gerencia({ Id: id, Title: nombre, Nombre: nombre, Departamento: { Id: departamentoId, Title: departamento } });

let gerencias: Gerencia[] = [
	createGerencia(1, 'B2B', 1, 'Marketing'),
	createGerencia(2, 'B2C', 1, 'Marketing'),
	createGerencia(3, 'Growth', 1, 'Marketing'),
	createGerencia(4, 'Convenios', 2, 'Alianzas'),
	createGerencia(5, 'Programas', 3, 'Fidelización')
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class GerenciaMock implements IGerenciaDataSource {
	public listTitle: string = Lista.Gerencia;

	public getItems(): Promise<Gerencia[]> {
		return Promise.resolve(gerencias.slice());
	}

	public add(item: Gerencia): Promise<Gerencia> {
		const nextId = gerencias.reduce((maxId, gerencia) => Math.max(maxId, gerencia.Id ?? 0), 0) + 1;
		const created = Object.assign(new Gerencia(), item, { Id: nextId });
		gerencias = gerencias.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Gerencia): Promise<Gerencia> {
		if (!gerencias.some((gerencia) => gerencia.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = Object.assign(new Gerencia(), item);
		gerencias = gerencias.map((gerencia) => (gerencia.Id === edited.Id ? edited : gerencia));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		gerencias = gerencias.filter((gerencia) => gerencia.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Gerencia> {
		const gerencia = gerencias.filter((item) => item.Id === itemId)[0];
		return gerencia ? Promise.resolve(gerencia) : Promise.reject(notFoundError());
	}
}
