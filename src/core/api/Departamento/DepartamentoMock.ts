import { Departamento } from '../../entities';
import { Lista } from '../../utils/Constants';
import IDepartamentoDataSource from './IDepartamentoDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe el departamento solicitado en el mock.';

const createDepartamento = (id: number, nombre: string): Departamento =>
	new Departamento({ Id: id, Title: nombre, Nombre: nombre });

let departamentos: Departamento[] = [
	createDepartamento(1, 'Marketing'),
	createDepartamento(2, 'Alianzas'),
	createDepartamento(3, 'Fidelización')
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class DepartamentoMock implements IDepartamentoDataSource {
	public listTitle: string = Lista.Departamento;

	public getItems(): Promise<Departamento[]> {
		return Promise.resolve(departamentos.slice());
	}

	public add(item: Departamento): Promise<Departamento> {
		const nextId = departamentos.reduce((maxId, departamento) => Math.max(maxId, departamento.Id ?? 0), 0) + 1;
		const created = new Departamento({ ...item.toListItem(), Id: nextId });
		departamentos = departamentos.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Departamento): Promise<Departamento> {
		if (!departamentos.some((departamento) => departamento.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = new Departamento(item.toListItem());
		departamentos = departamentos.map((departamento) => (departamento.Id === edited.Id ? edited : departamento));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		departamentos = departamentos.filter((departamento) => departamento.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Departamento> {
		const departamento = departamentos.filter((item) => item.Id === itemId)[0];
		return departamento ? Promise.resolve(departamento) : Promise.reject(notFoundError());
	}
}
