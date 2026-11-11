import { SPFI } from "@pnp/sp";
import { getSP } from '../../pnp/sp/pnpjs-presets';
import { Lista } from '../../utils/Constants';
import { Objetivo } from "../../entities";
import IObjetivoDataSource from './IObjetivoDataSource';

const TOP_DEFAULT = 5000;

export default class ObjetivoDataSource implements IObjetivoDataSource {
	private _sp: SPFI;
	public listTitle: string;
	private selectProperties: Array<string> = [
		'Id', 'Title',
		'Nombre',
		'Descripcion',
		'Palanca/Id', 'Palanca/Title',
		'Duracion',
		'CantidadAnios',
		'Peso',
		'FechaInicio',
		'FechaCompromiso',
		'Estado',
		'EsDelVp',
		'VP/Id', 'VP/Title',
		'Departamento/Id', 'Departamento/Title',
		'Gerencia/Id', 'Gerencia/Title',
		'Created', 'Modified',
		'Author/Id', 'Author/Title', 'Author/EMail',
		'Editor/Id', 'Editor/Title', 'Editor/EMail'
	];
	private expand: Array<string> = ['Author', 'Editor', 'Palanca', 'VP', 'Departamento', 'Gerencia'];

	constructor() {
		this._sp = getSP();
		this.listTitle = Lista.Objetivo;
	}

	public async getItems(): Promise<Array<Objetivo>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.top(TOP_DEFAULT)();
		return items.map(item => new Objetivo(item));
	}

	public async getFilteredItems(palancaId: number): Promise<Array<Objetivo>> {
		const items: any[] = await this._sp.web.lists.getByTitle(this.listTitle).items
			.select(...this.selectProperties)
			.expand(...this.expand)
			.filter(`PalancaId eq ${palancaId}`)
			.top(TOP_DEFAULT)();
		return items.map(item => new Objetivo(item));
	}

	public add(item: Objetivo): Promise<Objetivo> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items.add(listItem).then((result: any) => {
			return this.getById(result.Id ?? result.ID);
		});
	}

	public edit(item: Objetivo): Promise<Objetivo> {
		const listItem = item.toListItem();
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(item.Id as number)
			.update(listItem)
			.then(() => {
				return this.getById(item.Id as number);
			});
	}

	public delete(itemId: number): Promise<void> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.delete();
	}

	public async getById(itemId: number): Promise<Objetivo> {
		return this._sp.web.lists.getByTitle(this.listTitle).items
			.getById(itemId)
			.select(...this.selectProperties)
			.expand(...this.expand)()
			.then(item => new Objetivo(item));
	}

}
