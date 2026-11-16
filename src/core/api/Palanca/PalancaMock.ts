import { Palanca } from '../../entities';
import { Lista } from '../../utils/Constants';
import IPalancaDataSource from './IPalancaDataSource';

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_MESSAGE = 'No existe la palanca solicitada en el mock.';

const createPalanca = (id: number, nombre: string, descripcion: string, activa: boolean): Palanca =>
	new Palanca({ Id: id, Title: nombre, Nombre: nombre, Descripcion: descripcion, Activa: activa });

let palancas: Palanca[] = [
	createPalanca(1, 'Excelencia comercial', 'Crecer en clientes y ventas con una propuesta comercial competitiva en todos los canales.', true),
	createPalanca(2, 'Experiencia de cliente', 'Que cada contacto del cliente con YPF sea simple, ágil y consistente.', true),
	createPalanca(3, 'Nuevos negocios', 'Abrir nuevas fuentes de ingreso y usar los datos como ventaja competitiva.', true),
	createPalanca(4, 'Marca y portfolio', 'Fortalecer la marca YPF y ordenar el portfolio de productos y servicios.', true),
	createPalanca(5, 'Eficiencia en el canal', 'Palanca del período anterior.', false)
];

const notFoundError = (): Error => Object.assign(new Error(NOT_FOUND_MESSAGE), { status: NOT_FOUND_STATUS });

const byNombre = (a: Palanca, b: Palanca): number => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', 'es');

export default class PalancaMock implements IPalancaDataSource {
	public listTitle: string = Lista.Palanca;

	public getItems(): Promise<Palanca[]> {
		return Promise.resolve(palancas.slice().sort(byNombre));
	}

	public getActiveItems(): Promise<Palanca[]> {
		return Promise.resolve(palancas.filter((palanca) => palanca.Activa === true).sort(byNombre));
	}

	public add(item: Palanca): Promise<Palanca> {
		const nextId = palancas.reduce((maxId, palanca) => Math.max(maxId, palanca.Id ?? 0), 0) + 1;
		const created = new Palanca({ ...item.toListItem(), Id: nextId });
		palancas = palancas.concat([created]);
		return Promise.resolve(created);
	}

	public edit(item: Palanca): Promise<Palanca> {
		if (!palancas.some((palanca) => palanca.Id === item.Id)) {
			return Promise.reject(notFoundError());
		}
		const edited = new Palanca(item.toListItem());
		palancas = palancas.map((palanca) => (palanca.Id === edited.Id ? edited : palanca));
		return Promise.resolve(edited);
	}

	public delete(itemId: number): Promise<void> {
		palancas = palancas.filter((palanca) => palanca.Id !== itemId);
		return Promise.resolve();
	}

	public getById(itemId: number): Promise<Palanca> {
		const palanca = palancas.filter((item) => item.Id === itemId)[0];
		return palanca ? Promise.resolve(palanca) : Promise.reject(notFoundError());
	}
}
