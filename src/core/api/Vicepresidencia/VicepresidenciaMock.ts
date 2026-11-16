import { Vicepresidencia } from '../../entities';
import { Lista, VP_RRII_NOMBRE } from '../../utils/Constants';
import IVicepresidenciaDataSource from './IVicepresidenciaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la vicepresidencia solicitada en el mock.';

const createVicepresidencia = (id: number, nombre: string, activo: boolean): Vicepresidencia =>
	new Vicepresidencia({ Id: id, Title: nombre, Nombre: nombre, Activo: activo });

let vicepresidencias: Vicepresidencia[] = [
	createVicepresidencia(1, VP_RRII_NOMBRE, true),
	createVicepresidencia(2, 'VP Upstream', true),
	createVicepresidencia(3, 'VP Downstream', true),
	createVicepresidencia(4, 'VP Finanzas', true),
	createVicepresidencia(5, 'VP Anterior', false)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

export default class VicepresidenciaMock implements IVicepresidenciaDataSource {
	public listTitle: string = Lista.Vicepresidencia;

	public getItems(): Promise<Vicepresidencia[]> {
		return Promise.resolve(vicepresidencias.slice());
	}

	public add(item: Vicepresidencia): Promise<Vicepresidencia> {
		const nextId = vicepresidencias.reduce((maxId, vp) => Math.max(maxId, vp.Id ?? 0), 0) + 1;
		const created = new Vicepresidencia({ ...item.toListItem(), Id: nextId });
		vicepresidencias = vicepresidencias.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Vicepresidencia): Promise<Vicepresidencia> {
		if (!vicepresidencias.some((vp) => vp.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = new Vicepresidencia(item.toListItem());
		vicepresidencias = vicepresidencias.map((vp) => (vp.Id === edited.Id ? edited : vp));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		vicepresidencias = vicepresidencias.filter((vp) => vp.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Vicepresidencia> {
		const vicepresidencia = vicepresidencias.filter((item) => item.Id === itemId)[0];
		return vicepresidencia ? Promise.resolve(vicepresidencia) : Promise.reject(notFoundError());
	}
}
